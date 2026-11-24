import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router";

import { Dialog } from "@base-ui/react/dialog";
import { useIsMutating, useMutation, useQuery } from "@tanstack/react-query";

import { exceedsPostLimits, getPlan } from "@repo/shared/pricing";

import { ChannelIcon } from "@/components/channels/channel-icon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPost, deleteMedia, errorMessage, uploadMedia } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { CHANNELS, getChannel, isPublishingPlatform } from "@/lib/constants";
import { mutationKeys, queries, queryClient, refreshPosts } from "@/lib/query";
import { toast } from "@/lib/toast";
import type { Platform, PostInput } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  MediaUpload,
  useMediaUploads,
  validatePlatformMedia,
} from "./media-upload";
import { PostPreview } from "./preview";
import {
  isFutureSchedule,
  nextScheduledMinute,
  withScheduleTime,
} from "./schedule-time";

export function localDateTime(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
const ComposerContext = createContext<(date?: Date) => void>(() => {});
export const useComposer = () => useContext(ComposerContext);
export function CreatePostButton() {
  const open = useComposer();
  return (
    <Button onClick={() => open()}>
      <Icon name="plus" />
      Create a post
    </Button>
  );
}
export function ComposerProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<{ date?: Date } | null>(null);
  const busy = useIsMutating({ mutationKey: mutationKeys.createPost }) > 0;
  const openComposer = useCallback((date?: Date) => setRequest({ date }), []);
  return (
    <ComposerContext.Provider value={openComposer}>
      {children}
      <Dialog.Root
        disablePointerDismissal
        open={!!request}
        onOpenChange={(open, details) => {
          if (busy) {
            details.cancel();
            return;
          }
          if (!open) setRequest(null);
        }}
      >
        {request && (
          <PostComposer
            initialDate={request.date}
            close={() => setRequest(null)}
          />
        )}
      </Dialog.Root>
    </ComposerContext.Provider>
  );
}
type Content = { text: string; files: File[] };
const emptyContent = (): Content => ({ text: "", files: [] });
function PostComposer({
  initialDate,
  close,
}: {
  initialDate?: Date;
  close: () => void;
}) {
  const accounts = useQuery(queries.accounts());
  const { data: session } = authClient.useSession();
  const [providers, setProviders] = useState<Platform[]>([]);
  const [shared, setShared] = useState<Content>(emptyContent);
  const [variants, setVariants] = useState<Partial<Record<Platform, Content>>>(
    {}
  );
  const [customized, setCustomized] = useState(false);
  const [active, setActive] = useState<Platform>("linkedin");
  const [scheduled, setScheduled] = useState(!!initialDate);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const [when, setWhen] = useState(() =>
    localDateTime(initialDate ?? new Date(Date.now() + 3600_000))
  );
  const [showDate, setShowDate] = useState(false);
  const selectedDate = new Date(when);
  const invalidSchedule = scheduled && !isFutureSchedule(selectedDate, now);
  const previewPlatform =
    !providers.length || providers.includes(active) ? active : providers[0]!;
  const previewContent = customized
    ? (variants[previewPlatform] ?? shared)
    : shared;
  const mediaIssues = providers.flatMap((id) => {
    const content = customized ? (variants[id] ?? shared) : shared;
    const error = validatePlatformMedia(id, content.files);
    return error ? [`${getChannel(id)?.name}: ${error}`] : [];
  });
  const uploads = useMediaUploads(uploadMedia, deleteMedia);
  useEffect(() => {
    const used = new Set([
      ...shared.files,
      ...Object.values(variants).flatMap((content) => content.files),
    ]);
    for (const file of uploads.entries.keys()) {
      if (!used.has(file)) uploads.release(file);
    }
  }, [shared, variants, uploads]);
  const publishingFiles = [
    ...new Set(
      providers.flatMap(
        (id) => (customized ? (variants[id] ?? shared) : shared).files
      )
    ),
  ];
  const uploadsBlocked = publishingFiles.some(
    (file) => uploads.entries.get(file)?.status !== "uploaded"
  );
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  function update(content: Content, platform?: Platform) {
    if (platform) setVariants((old) => ({ ...old, [platform]: content }));
    else setShared(content);
  }
  const mutation = useMutation({
    mutationKey: mutationKeys.createPost,
    mutationFn: async () => {
      if (!providers.length)
        throw new Error("Choose at least one connected channel.");
      if (
        providers.some((id) => !accounts.data?.some((a) => a.providerId === id))
      )
        throw new Error(
          "A selected channel is disconnected. Update your selection."
        );
      if (
        scheduled &&
        (!Number.isFinite(Date.parse(when)) || Date.parse(when) <= Date.now())
      )
        throw new Error("Choose a date and time in the future.");
      const contentFor = (id: Platform) =>
        customized ? (variants[id] ?? shared) : shared;
      for (const id of providers) {
        const content = contentFor(id);
        if (!content.text.trim() && !content.files.length)
          throw new Error(`Add text or media for ${getChannel(id)?.name}.`);
        if (
          content.text.length >
          (id === "twitter" ? 280 : id === "instagram" ? 2200 : 3000)
        )
          throw new Error(`Your ${getChannel(id)?.name} caption is too long.`);
        const mediaError = validatePlatformMedia(id, content.files);
        if (mediaError) throw new Error(mediaError);
      }
      const [posts, subscription] = await Promise.all([
        queryClient.fetchQuery({ ...queries.posts(), staleTime: 0 }),
        queryClient.fetchQuery({ ...queries.subscription(), staleTime: 0 }),
      ]);
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const monthly = posts.filter((p) => new Date(p.createdAt) >= monthStart);
      if (
        exceedsPostLimits(
          getPlan(subscription.subscription?.planId),
          monthly.length + providers.length,
          scheduled
            ? monthly.filter((p) => p.isScheduled).length + providers.length
            : 0
        )
      )
        throw new Error(
          "Monthly post limit reached. Compare plans in Billing."
        );
      const filesToPublish = [
        ...new Set(providers.flatMap((id) => contentFor(id).files)),
      ];
      uploads.keys(filesToPublish);
      const platformContent: PostInput["platformContent"] = {};
      for (const id of providers) {
        const content = contentFor(id);
        platformContent[id] = {
          text: content.text.trim(),
          mediaKeys: uploads.keys(content.files),
        };
      }
      uploads.retain(filesToPublish);
      return createPost({
        text: shared.text.trim(),
        mediaKeys: [],
        providers,
        platformContent,
        scheduleAt: scheduled ? new Date(when).toISOString() : undefined,
      });
    },
    onSuccess: () => {
      void refreshPosts();
      toast.success(
        scheduled ? "Your post is scheduled." : "Your post is on its way!"
      );
      close();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  function renderEditor(platform?: Platform) {
    const content = platform ? (variants[platform] ?? shared) : shared;
    const selected = platform ? [platform] : providers;
    const limit = selected.includes("twitter")
      ? 280
      : selected.includes("instagram")
        ? 2200
        : 3000;
    const captionId = `post-caption-${platform ?? "shared"}`;
    return (
      <div
        key={platform ?? "shared"}
        className="rounded-xl border bg-muted/35 p-4 sm:p-5"
        onFocusCapture={() => {
          if (platform) setActive(platform);
        }}
      >
        <label
          htmlFor={captionId}
          className="mb-3 flex items-center gap-2 text-sm font-medium"
        >
          <Icon name={platform ?? "layers"} />
          {platform ? getChannel(platform)?.name : "Your caption"}
          {platform === "instagram" && (
            <span className="ml-auto text-[10px] font-normal text-muted-foreground">
              Photo or video required
            </span>
          )}
        </label>
        <textarea
          id={captionId}
          className="min-h-44 w-full resize-y bg-transparent text-sm leading-7 outline-none placeholder:text-muted-foreground/60"
          placeholder={
            platform
              ? `Write your ${getChannel(platform)?.name} caption…`
              : "What would you like to share?"
          }
          value={content.text}
          aria-invalid={content.text.length > limit}
          aria-describedby={`${captionId}-count`}
          onChange={(event) =>
            update({ ...content, text: event.target.value }, platform)
          }
        />
        <MediaUpload
          files={content.files}
          platforms={selected}
          uploads={uploads}
          disabled={mutation.isPending}
          onChange={(files) => update({ ...content, files }, platform)}
        />
        <p
          id={`${captionId}-count`}
          className={`mt-4 text-right text-xs ${content.text.length > limit ? "text-destructive" : "text-muted-foreground"}`}
        >
          {content.text.length} / {limit}
        </p>
      </div>
    );
  }
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" />
      <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex h-[90dvh] max-h-[94dvh] w-[min(1120px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <Dialog.Close
          render={
            <Button
              variant="secondary"
              size="icon"
              disabled={mutation.isPending}
              aria-label="Close composer"
              className={cn(
                "absolute top-2 right-2 z-30 size-8 rounded-full",
                mutation.isPending && "opacity-50"
              )}
            />
          }
        >
          <Icon name="close" />
        </Dialog.Close>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <fieldset
            disabled={mutation.isPending}
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <div className="grid min-h-0 w-full min-w-0 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:overflow-hidden">
              <section
                aria-label="Post content"
                className="min-h-0 min-w-0 lg:overflow-y-auto"
              >
                <Tabs
                  value={customized ? "customized" : "shared"}
                  className="gap-0"
                  onValueChange={(value) => {
                    if (value === "customized") {
                      setVariants((old) => {
                        const next = { ...old };
                        for (const id of providers) next[id] ??= { ...shared };
                        return next;
                      });
                    }
                    setCustomized(value === "customized");
                  }}
                >
                  <div className="sticky top-0 z-20 space-y-4 bg-background p-5 sm:px-7">
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="Publishing channels"
                    >
                      {CHANNELS.map((channel) => {
                        const supported = isPublishingPlatform(channel.id);
                        const connected = !!accounts.data?.some(
                          (a) => a.providerId === channel.id
                        );
                        const selected =
                          isPublishingPlatform(channel.id) &&
                          providers.includes(channel.id);
                        const label = `${channel.name}${!supported || channel.locked ? " — publishing coming soon" : !connected ? " — connect this channel first" : ""}`;
                        return (
                          <Button
                            key={channel.id}
                            type="button"
                            variant={selected ? "secondary" : "outline"}
                            className={`size-12 rounded-xl ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                            title={label}
                            aria-label={label}
                            aria-pressed={selected}
                            onClick={() => {
                              if (!isPublishingPlatform(channel.id)) return;
                              const id = channel.id;
                              const next = providers.includes(id)
                                ? providers.filter((p) => p !== id)
                                : [...providers, id];
                              setProviders(next);
                              setActive(
                                next.includes(id) ? id : (next[0] ?? "linkedin")
                              );
                              if (customized && !variants[id])
                                setVariants((old) => ({
                                  ...old,
                                  [id]: { ...shared },
                                }));
                            }}
                          >
                            <ChannelIcon
                              channel={channel}
                              connected={connected}
                              size={24}
                            />
                          </Button>
                        );
                      })}
                    </div>
                    {accounts.isError && (
                      <p role="alert" className="text-xs text-destructive">
                        Connections couldn’t load.{" "}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => accounts.refetch()}
                        >
                          Try again
                        </button>
                      </p>
                    )}
                    {accounts.isSuccess &&
                      !accounts.data.some((a) =>
                        isPublishingPlatform(a.providerId)
                      ) && (
                        <Link
                          to="/connections"
                          onClick={close}
                          className="text-xs underline"
                        >
                          Connect a channel to start publishing
                        </Link>
                      )}
                    <TabsList aria-label="Content mode">
                      <TabsTrigger
                        className={"px-4"}
                        value="shared"
                        disabled={mutation.isPending}
                      >
                        Same post for all
                      </TabsTrigger>
                      <TabsTrigger
                        value="customized"
                        disabled={mutation.isPending}
                      >
                        Customize per platform
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="shared" className="p-5 sm:p-7">
                    {renderEditor()}
                  </TabsContent>
                  <TabsContent
                    value="customized"
                    className="space-y-5 p-5 sm:p-7"
                  >
                    {providers.length ? (
                      providers.map((id) => renderEditor(id))
                    ) : (
                      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Select platforms above to customize each post.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </section>
              <aside className="min-h-0 min-w-0 border-t bg-muted/15 p-4 sm:p-6 lg:overflow-y-auto lg:border-t-0 lg:border-l">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-medium">Post preview</h2>
                  <Select
                    value={previewPlatform}
                    onValueChange={(value) => {
                      if (value && isPublishingPlatform(value))
                        setActive(value);
                    }}
                    items={(providers.length
                      ? providers
                      : ["linkedin", "twitter", "instagram"]
                    ).map((id) => ({ value: id, label: getChannel(id)?.name }))}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger
                      aria-label="Preview platform"
                      className="w-36"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(providers.length
                        ? providers
                        : ["linkedin", "twitter", "instagram"]
                      ).map((id) => (
                        <SelectItem value={id} key={id}>
                          {getChannel(id)?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <PostPreview
                  key={previewPlatform}
                  platform={providers.length ? previewPlatform : active}
                  text={previewContent.text}
                  files={previewContent.files}
                  author={{
                    name: session?.user.name ?? "Your name",
                    image: session?.user.image,
                  }}
                />
                <p className="mt-4 text-[10px] leading-5 text-muted-foreground">
                  Preview only. Cropping and layout can vary by device and
                  platform.
                </p>
              </aside>
            </div>
          </fieldset>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-muted/20 px-6 py-4">
            <div className="flex items-center gap-2">
              {providers.map((id) => (
                <div key={id} className="size-12 rounded-full bg-secondary p-2 flex items-center justify-center -mr-6 ring-2 ring-primary/50 ring-offset-1 ring-offset-background">
                  <ChannelIcon showLock={false} connected={true} channel={getChannel(id)!} size={24} className="z-0" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={scheduled ? "schedule" : "now"}
                items={[
                  { value: "now", label: "Post now" },
                  { value: "schedule", label: "Set date and time" },
                ]}
                disabled={mutation.isPending}
                onValueChange={(value) => {
                  setScheduled(value === "schedule");
                  setShowDate(value === "schedule");
                }}
              >
                <SelectTrigger aria-label="Posting action" className="h-9 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Post now</SelectItem>
                  <SelectItem value="schedule">Set date and time</SelectItem>
                </SelectContent>
              </Select>
              {scheduled && (
                <Popover
                  open={showDate}
                  onOpenChange={(open) => {
                    setNow(new Date());
                    setShowDate(open);
                  }}
                >
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        disabled={mutation.isPending}
                        className="h-9"
                      />
                    }
                  >
                    <Icon name="calendar" />
                    {new Date(when).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    side="top"
                    className="max-h-(--available-height) w-auto max-w-[calc(100vw-2rem)] gap-2 overflow-y-auto p-3"
                  >
                    <h3 className="mb-2 text-sm font-medium">
                      Schedule your post
                    </h3>
                    <Calendar
                      mode="single"
                      required
                      selected={new Date(when)}
                      defaultMonth={new Date(when)}
                      disabled={{
                        before: new Date(
                          now.getFullYear(),
                          now.getMonth(),
                          now.getDate()
                        ),
                      }}
                      onSelect={(date) => {
                        const next = new Date(when);
                        next.setFullYear(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate()
                        );
                        setWhen(
                          localDateTime(
                            isFutureSchedule(next, new Date())
                              ? next
                              : nextScheduledMinute(new Date())
                          )
                        );
                      }}
                    />
                    <div className="mt-3 flex items-center justify-between gap-4 border-t pt-3 text-xs">
                      <span>Time</span>
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(selectedDate.getHours())}
                          disabled={mutation.isPending}
                          items={Array.from({ length: 24 }, (_, hour) => ({
                            value: String(hour),
                            label: `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`,
                          }))}
                          onValueChange={(value) => {
                            if (value === null) return;
                            const hour = Number(value);
                            const current = new Date();
                            const candidate = withScheduleTime(
                              selectedDate,
                              hour,
                              selectedDate.getMinutes()
                            );
                            const firstAvailable = Array.from(
                              { length: 60 },
                              (_, minute) =>
                                withScheduleTime(selectedDate, hour, minute)
                            ).find((date) => isFutureSchedule(date, current));
                            if (isFutureSchedule(candidate, current))
                              setWhen(localDateTime(candidate));
                            else if (firstAvailable)
                              setWhen(localDateTime(firstAvailable));
                          }}
                        >
                          <SelectTrigger
                            aria-label="Scheduled hour"
                            className="w-24"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            {Array.from({ length: 24 }, (_, hour) => (
                              <SelectItem
                                key={hour}
                                value={String(hour)}
                                disabled={
                                  !isFutureSchedule(
                                    withScheduleTime(selectedDate, hour, 59),
                                    now
                                  )
                                }
                              >
                                {hour % 12 || 12} {hour < 12 ? "AM" : "PM"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span aria-hidden="true">:</span>
                        <Select
                          value={String(selectedDate.getMinutes())}
                          disabled={mutation.isPending}
                          items={Array.from({ length: 60 }, (_, minute) => ({
                            value: String(minute),
                            label: String(minute).padStart(2, "0"),
                          }))}
                          onValueChange={(value) => {
                            if (value === null) return;
                            const date = withScheduleTime(
                              selectedDate,
                              selectedDate.getHours(),
                              Number(value)
                            );
                            if (isFutureSchedule(date, new Date()))
                              setWhen(localDateTime(date));
                          }}
                        >
                          <SelectTrigger
                            aria-label="Scheduled minute"
                            className="w-16"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            {Array.from({ length: 60 }, (_, minute) => (
                              <SelectItem
                                key={minute}
                                value={String(minute)}
                                disabled={
                                  !isFutureSchedule(
                                    withScheduleTime(
                                      selectedDate,
                                      selectedDate.getHours(),
                                      minute
                                    ),
                                    now
                                  )
                                }
                              >
                                {String(minute).padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {invalidSchedule && (
                      <p role="status" className="text-xs text-destructive">
                        This time has passed. Choose a future time.
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {timezone}
                    </p>
                    <Button
                      type="button"
                      className="mt-3 w-full"
                      disabled={invalidSchedule || mutation.isPending}
                      onClick={() => setShowDate(false)}
                    >
                      Done
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
              <Button
                type="submit"
                className="h-9 px-4"
                disabled={
                  mutation.isPending ||
                  accounts.isPending ||
                  accounts.isError ||
                  mediaIssues.length > 0 ||
                  invalidSchedule ||
                  uploadsBlocked ||
                  !providers.length
                }
              >
                <Icon name={scheduled ? "calendar" : "send"} />
                {mutation.isPending
                  ? "Sending…"
                  : publishingFiles.some(
                        (file) =>
                          uploads.entries.get(file)?.status === "uploading"
                      )
                    ? "Uploading media…"
                    : scheduled
                      ? "Schedule Post"
                      : "Post now"}
              </Button>
            </div>
          </footer>
        </form>
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

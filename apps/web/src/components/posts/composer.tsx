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
import { toast } from "sonner";

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
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { createPost, errorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { CHANNELS, getChannel, isPublishingPlatform } from "@/lib/constants";
import { mutationKeys, queries, queryClient, refreshPosts } from "@/lib/query";
import type { Platform, PostInput } from "@/lib/types";

import {
  MEDIA_ACCEPT,
  validateAttachments,
  validatePlatformMedia,
} from "./media-validation";
import { PostPreview } from "./preview";
import { MediaFile } from "./preview/media";
import {
  isFutureSchedule,
  nextScheduledMinute,
  withScheduleTime,
} from "./schedule-time";
import { useMediaUploads } from "./use-media-uploads";

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
  const current = customized ? (variants[active] ?? shared) : shared;
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
  const uploads = useMediaUploads();
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
  function removeFile(file: File) {
    const nextShared = {
      ...shared,
      files: shared.files.filter((item) => item !== file),
    };
    // Removing from a custom platform must not erase another platform's media.
    if (customized) {
      const nextContent = {
        ...current,
        files: current.files.filter((item) => item !== file),
      };
      setVariants((old) => ({ ...old, [active]: nextContent }));
      const stillUsed =
        shared.files.includes(file) ||
        Object.entries(variants).some(
          ([id, content]) => id !== active && content.files.includes(file)
        );
      if (!stillUsed) uploads.release(file);
    } else {
      setShared(nextShared);
      if (
        !Object.values(variants).some((content) => content.files.includes(file))
      )
        uploads.release(file);
    }
  }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  function update(content: Content) {
    if (customized) setVariants((old) => ({ ...old, [active]: content }));
    else setShared(content);
  }
  function addFiles(files: File[]) {
    const error = validateAttachments([...current.files, ...files]);
    if (error) {
      return error;
    }
    update({ ...current, files: [...current.files, ...files] });
    uploads.start(files);
    return undefined;
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
      // Uploads start when files are selected; submission only uses completed keys.
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
  const limit = customized
    ? active === "twitter"
      ? 280
      : active === "instagram"
        ? 2200
        : 3000
    : providers.includes("twitter")
      ? 280
      : providers.includes("instagram")
        ? 2200
        : 3000;
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" />
      <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[94dvh] w-[min(1120px,96vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <Dialog.Title className="text-xl font-medium">
              Create Post
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-xs text-muted-foreground">
              One idea, every channel. Make it yours.
            </Dialog.Description>
          </div>
          <Dialog.Close
            render={
              <Button
                variant="ghost"
                size="icon"
                disabled={mutation.isPending}
                aria-label="Close composer"
              />
            }
          >
            <Icon name="close" />
          </Dialog.Close>
        </header>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <fieldset
            disabled={mutation.isPending}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto"
          >
            <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
              <section className="min-w-0 space-y-5 p-5 sm:p-7">
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
                        className={`size-12 rounded-xl ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                        title={label}
                        aria-label={label}
                        aria-pressed={selected}
                        disabled={
                          !supported ||
                          !connected ||
                          channel.locked ||
                          accounts.isPending ||
                          accounts.isError
                        }
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
                <div className="flex flex-wrap gap-2" aria-label="Content mode">
                  <Button
                    type="button"
                    variant={!customized ? "secondary" : "ghost"}
                    aria-pressed={!customized}
                    onClick={() => setCustomized(false)}
                  >
                    Same post for all
                  </Button>
                  <Button
                    type="button"
                    variant={customized ? "secondary" : "ghost"}
                    aria-pressed={customized}
                    onClick={() => {
                      setVariants((old) => {
                        const next = { ...old };
                        for (const id of providers) next[id] ??= { ...shared };
                        return next;
                      });
                      setCustomized(true);
                      if (!providers.includes(active) && providers[0])
                        setActive(providers[0]);
                    }}
                  >
                    Customize per platform
                  </Button>
                </div>
                {customized && (
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Edit platform content"
                  >
                    {providers.map((id) => (
                      <Button
                        key={id}
                        type="button"
                        variant={active === id ? "secondary" : "outline"}
                        aria-pressed={active === id}
                        onClick={() => setActive(id)}
                      >
                        {getChannel(id)?.name}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="rounded-xl border bg-muted/35 p-4 sm:p-5">
                  <label
                    htmlFor="post-caption"
                    className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Icon name={customized ? active : "layers"} />
                    {customized
                      ? `${getChannel(active)?.name} caption`
                      : "Your caption"}
                  </label>
                  <textarea
                    id="post-caption"
                    className="min-h-52 w-full resize-y bg-transparent text-sm leading-7 outline-none placeholder:text-muted-foreground/60"
                    placeholder="What would you like to share?"
                    value={current.text}
                    onChange={(e) =>
                      update({ ...current, text: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {current.files.map((file, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="relative"
                      >
                        <MediaFile
                          file={file}
                          className="aspect-video rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => removeFile(file)}
                        >
                          <Icon name="close" />
                        </Button>
                        {current.files.length > 1 && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 p-1 shadow-sm">
                            <span className="px-1 text-[10px]">
                              {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Move ${file.name} earlier`}
                              disabled={index === 0}
                              onClick={() => {
                                const files = [...current.files];
                                [files[index - 1], files[index]] = [
                                  files[index]!,
                                  files[index - 1]!,
                                ];
                                update({ ...current, files });
                              }}
                            >
                              <Icon name="back" size={12} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Move ${file.name} later`}
                              disabled={index === current.files.length - 1}
                              onClick={() => {
                                const files = [...current.files];
                                [files[index], files[index + 1]] = [
                                  files[index + 1]!,
                                  files[index]!,
                                ];
                                update({ ...current, files });
                              }}
                            >
                              <Icon name="arrow" size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <UploadDropzone
                      accept={MEDIA_ACCEPT}
                      disabled={mutation.isPending}
                      files={current.files.map(
                        (file) =>
                          uploads.entries.get(file) ?? {
                            file,
                            status: "uploading",
                            progress: 0,
                          }
                      )}
                      onFiles={addFiles}
                      onRemove={removeFile}
                      onRetry={uploads.retry}
                    />
                  </div>
                  <p
                    className={`mt-4 text-right text-xs ${current.text.length > limit ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {current.text.length} / {limit}
                  </p>
                  {mediaIssues.length > 0 && (
                    <div
                      role="status"
                      className="mt-3 space-y-1 text-xs leading-5 text-destructive"
                    >
                      {mediaIssues.map((issue) => (
                        <p key={issue}>{issue}</p>
                      ))}
                    </div>
                  )}
                </div>
              </section>
              <aside className="min-w-0 border-t bg-muted/15 p-4 sm:p-6 lg:border-t-0 lg:border-l">
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
                  key={`${previewPlatform}-${previewContent.files.map((f) => f.name + f.lastModified).join("-")}`}
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
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-6 py-4">
            <span className="text-xs text-muted-foreground">
              {providers.length} channel{providers.length === 1 ? "" : "s"}{" "}
              selected
            </span>
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

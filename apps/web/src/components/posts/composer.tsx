import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router";

import { ArrowRight, Plus } from "@keyline-icons/react/duotone";
import { useIsMutating, useMutation } from "@tanstack/react-query";

import { PLATFORM_RULES, PLATFORMS } from "@repo/shared/platforms";
import { exceedsPostLimits, getPlan } from "@repo/shared/pricing";

import { ProviderStack } from "@/components/post/provider-stack";
import {
  AccountPicker,
  Counter,
  Field,
  formatWhen,
  FULL_PAGE_DIALOG,
  hashtags,
  localInput,
  MAX_SCHEDULE_DAYS,
  nextHour,
  Section,
  Segment,
} from "@/components/post/shared";
import { useConnections } from "@/components/post/use-social";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createPost, deleteMedia, errorMessage, uploadMedia } from "@/lib/api";
import type { SocialProvider } from "@/lib/api/post";
import { authClient } from "@/lib/auth-client";
import { getChannel } from "@/lib/constants";
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

const ComposerContext = createContext<(date?: Date) => void>(() => {});
export const useComposer = () => useContext(ComposerContext);
export function CreatePostButton() {
  const open = useComposer();
  return (
    <Button variant="primary" onClick={() => open()}>
      <Plus />
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
      <Dialog
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
      </Dialog>
    </ComposerContext.Provider>
  );
}
type Content = { text: string; files: File[] };
const emptyContent = (): Content => ({ text: "", files: [] });

const LIMITS = Object.fromEntries(
  PLATFORMS.map((id) => [id, PLATFORM_RULES[id].text])
) as Record<Platform, number>;

const NOTES = Object.fromEntries(
  PLATFORMS.map((id) => [id, PLATFORM_RULES[id].note])
) as Record<Platform, string>;

const platformOf = (provider: SocialProvider): Platform | null => {
  if (provider === "x") return "twitter";
  return (PLATFORMS as readonly string[]).includes(provider)
    ? (provider as Platform)
    : null;
};

const providerOf = (platform: Platform): SocialProvider =>
  platform === "twitter" ? "x" : platform;

const WHEN = [
  { id: false, label: "Now" },
  { id: true, label: "Schedule" },
] as const;

const MODE = [
  { id: false, label: "Same for all" },
  { id: true, label: "Per platform" },
] as const;

type CreatedPosts = { results: { provider: Platform; jobId: string }[] };

async function waitForPublish(ids: string[]) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => window.setTimeout(resolve, 2000));
    const posts = await queryClient.fetchQuery({
      ...queries.posts(),
      staleTime: 0,
    });
    const mine = posts.filter((post) => ids.includes(post.id));
    const failed = mine.find((post) => post.status === "FAILED");
    if (failed)
      throw new Error(
        `Couldn’t post to ${getChannel(failed.provider)?.name ?? failed.provider}.`
      );
    if (
      mine.length === ids.length &&
      mine.every((p) => p.status === "SUCCESS")
    ) {
      void refreshPosts();
      return;
    }
  }
  throw new Error("Still posting. Check All posts in a minute.");
}

function PostComposer({
  initialDate,
  close,
}: {
  initialDate?: Date;
  close: () => void;
}) {
  const { data: connections = [], isPending: connectionsPending } =
    useConnections();
  const { data: session } = authClient.useSession();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState(false);
  const [shared, setShared] = useState<Content>(emptyContent);
  const [variants, setVariants] = useState<Partial<Record<Platform, Content>>>(
    {}
  );
  const [customized, setCustomized] = useState(false);
  const [preview, setPreview] = useState<Platform>("linkedin");
  const [scheduling, setScheduling] = useState(!!initialDate);
  const [when, setWhen] = useState(() => localInput(initialDate ?? nextHour()));

  useEffect(() => {
    if (picked) return;
    setSelected(
      new Set(
        connections
          .filter(
            (item) => item.status === "ACTIVE" && platformOf(item.provider)
          )
          .map((item) => item.id)
      )
    );
  }, [connections, picked]);

  const publishable = connections.filter((item) => platformOf(item.provider));
  const targets = publishable.filter((item) => selected.has(item.id));
  const providers = [
    ...new Set(targets.map((item) => platformOf(item.provider)!)),
  ];
  const contentFor = (id: Platform) =>
    customized ? (variants[id] ?? shared) : shared;
  const previewPlatform = providers.includes(preview)
    ? preview
    : (providers[0] ?? preview);
  const previewContent = contentFor(previewPlatform);

  const mediaIssues = providers.flatMap((id) => {
    const error = validatePlatformMedia(id, contentFor(id).files);
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
    ...new Set(providers.flatMap((id) => contentFor(id).files)),
  ];
  const uploading = publishingFiles.some(
    (file) => uploads.entries.get(file)?.status === "uploading"
  );
  const uploadsBlocked = publishingFiles.some(
    (file) => uploads.entries.get(file)?.status !== "uploaded"
  );
  const tooLong = providers.some(
    (id) => contentFor(id).text.length > LIMITS[id]
  );
  const empty = providers.some(
    (id) => !contentFor(id).text.trim() && !contentFor(id).files.length
  );

  const scheduledMs = new Date(when).getTime() - Date.now();
  const scheduleValid =
    Number.isFinite(scheduledMs) &&
    scheduledMs > 0 &&
    scheduledMs <= MAX_SCHEDULE_DAYS * 86_400_000;

  function update(content: Content, platform?: Platform) {
    if (platform) setVariants((old) => ({ ...old, [platform]: content }));
    else setShared(content);
  }

  function toggle(id: string) {
    setPicked(true);
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function setMode(value: boolean) {
    if (value)
      setVariants((old) => {
        const next = { ...old };
        for (const id of providers) next[id] ??= { ...shared };
        return next;
      });
    setCustomized(value);
  }

  const mutation = useMutation({
    mutationKey: mutationKeys.createPost,
    mutationFn: async () => {
      if (!providers.length) throw new Error("Choose an account to post to.");
      if (scheduling && !scheduleValid)
        throw new Error("Choose a date and time in the future.");
      for (const id of providers) {
        const content = contentFor(id);
        if (!content.text.trim() && !content.files.length)
          throw new Error(`Add text or media for ${getChannel(id)?.name}.`);
        if (content.text.length > LIMITS[id])
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
          scheduling
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
        scheduleAt: scheduling ? new Date(when).toISOString() : undefined,
      });
    },
    onSuccess: () => {
      void refreshPosts();
      close();
    },
  });

  function publish() {
    const where =
      targets.length === 1 ? targets[0]!.name : `${targets.length} accounts`;
    const later = scheduling;
    const at = formatWhen(new Date(when).toISOString());
    toast
      .promise(
        mutation
          .mutateAsync()
          .then((created: CreatedPosts) =>
            later
              ? undefined
              : waitForPublish(created.results.map((item) => item.jobId))
          ),
        {
          loading: later ? "Scheduling…" : `Posting to ${where}…`,
          success: later
            ? `Scheduled for ${at} on ${where}`
            : `Posted to ${where}`,
          error: (error) => errorMessage(error),
        }
      )
      .catch(() => undefined);
  }

  function editor(platform?: Platform) {
    const content = platform ? (variants[platform] ?? shared) : shared;
    const limits = platform ? [platform] : providers;
    const limit = Math.min(...limits.map((id) => LIMITS[id]), 3000);
    const id = `post-caption-${platform ?? "shared"}`;
    const fields = (
      <>
        <Field
          id={id}
          label="Caption"
          provider={platform ? providerOf(platform) : undefined}
          counter={
            <>
              {limits.includes("instagram") && (
                <Counter value={hashtags(content.text)} max={30} unit="tags" />
              )}
              <Counter value={content.text.length} max={limit} />
            </>
          }
        >
          <Textarea
            id={id}
            value={content.text}
            placeholder={
              platform
                ? `Write your ${getChannel(platform)?.name} caption…`
                : "What would you like to share?"
            }
            aria-invalid={content.text.length > limit}
            onFocus={() => platform && setPreview(platform)}
            onChange={(event) =>
              update({ ...content, text: event.target.value }, platform)
            }
            className="min-h-40 max-h-72 focus-visible:outline-0 focus-visible:ring-0"
          />
        </Field>
        <MediaUpload
          files={content.files}
          platforms={limits}
          uploads={uploads}
          disabled={mutation.isPending}
          onChange={(files) => update({ ...content, files }, platform)}
        />
      </>
    );
    return platform ? (
      <Section
        key={platform}
        provider={providerOf(platform)}
        note={NOTES[platform]}
      >
        {fields}
      </Section>
    ) : (
      <Section
        key="shared"
        title="Your post"
        icon={
          <ProviderStack
            size="lg"
            providers={providers.map(providerOf)}
            className="-space-x-1"
          />
        }
        note="One caption and media for every account you picked."
      >
        {fields}
      </Section>
    );
  }

  const label = mutation.isPending
    ? scheduling
      ? "Scheduling…"
      : "Posting…"
    : uploading
      ? "Uploading media…"
      : targets.length === 0
        ? "Choose an account"
        : scheduling
          ? "Schedule"
          : targets.length > 1
            ? `Post to ${targets.length} accounts`
            : `Post to ${targets[0]!.name}`;

  return (
    <DialogContent
      showCloseButton={!mutation.isPending}
      className={cn(
        FULL_PAGE_DIALOG,
        "flex flex-col gap-0 overflow-hidden p-0 rounded-4xl"
      )}
    >
      <DialogHeader className="border-b p-5 sm:p-6">
        <DialogTitle className="heading flex items-center gap-2 text-xl!">
          Create post
        </DialogTitle>
        <DialogDescription className="subheading text-base!">
          Post straight to Instagram, LinkedIn and X.
        </DialogDescription>
      </DialogHeader>

      <fieldset
        disabled={mutation.isPending}
        className="grid min-h-0 min-w-0 flex-1 overflow-y-auto scrollbar-none lg:grid-cols-[minmax(0,1fr)_24rem] lg:overflow-hidden"
      >
        <div className="order-2 space-y-4 p-5 sm:p-6 lg:order-1 lg:overflow-y-auto scrollbar-none">
          {providers.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label>Content</Label>
              <Segment
                label="Content mode"
                value={customized}
                options={MODE}
                onChange={setMode}
              />
            </div>
          )}
          {providers.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
              Choose an account to write its post.
            </p>
          ) : customized && providers.length > 1 ? (
            providers.map((id) => editor(id))
          ) : (
            editor()
          )}
          {mediaIssues.length > 0 && (
            <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              {mediaIssues.map((issue) => (
                <p key={issue}>{issue}</p>
              ))}
            </div>
          )}
        </div>

        <aside className="order-1 border-b lg:order-2 lg:overflow-y-auto scrollbar-none lg:border-b-0 lg:border-l">
          <div className="space-y-6 p-5 sm:p-6">
            <section className="space-y-3">
              <Label>Post to</Label>
              {connectionsPending ? (
                <Skeleton className="h-8 w-full rounded-full" />
              ) : (
                <AccountPicker
                  connections={publishable}
                  selected={selected}
                  onToggle={toggle}
                  onConnect={close}
                />
              )}
              {publishable.length === 0 && !connectionsPending && (
                <Link
                  to="/connections"
                  onClick={close}
                  className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Manage social accounts
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </section>

            <section className="space-y-3">
              <Label>When</Label>
              <div className="w-fit space-y-2">
                <Segment
                  label="When to post"
                  value={scheduling}
                  options={WHEN}
                  onChange={setScheduling}
                />
                {scheduling && (
                  <DateTimePicker
                    aria-label="Post at"
                    value={when}
                    onChange={setWhen}
                    min={new Date()}
                    max={new Date(Date.now() + MAX_SCHEDULE_DAYS * 86_400_000)}
                  />
                )}
              </div>
            </section>

            <Button
              variant="primary"
              className="w-full"
              onClick={publish}
              disabled={
                mutation.isPending ||
                targets.length === 0 ||
                tooLong ||
                empty ||
                mediaIssues.length > 0 ||
                uploadsBlocked ||
                (scheduling && !scheduleValid)
              }
            >
              {label}
            </Button>
          </div>

          <div className="space-y-3 border-t p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm txt text-muted-foreground">Preview</p>
              {providers.length > 1 && (
                <Segment
                  label="Preview platform"
                  value={previewPlatform}
                  options={providers.map((id) => ({
                    id,
                    label: getChannel(id)?.name.split(" ")[0] ?? id,
                  }))}
                  onChange={setPreview}
                />
              )}
            </div>
            <PostPreview
              key={previewPlatform}
              platform={previewPlatform}
              text={previewContent.text}
              files={previewContent.files}
              author={{
                name: session?.user.name ?? "Your name",
                image: session?.user.image,
              }}
            />
            <p className="text-xs text-muted-foreground">
              Preview only. Cropping and layout can vary by device and platform.
            </p>
          </div>
        </aside>
      </fieldset>
    </DialogContent>
  );
}

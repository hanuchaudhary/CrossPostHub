import type { Platform } from "@/lib/types";
import { CHANNELS, getChannel, isPublishingPlatform } from "@/lib/constants";
import { ChannelIcon } from "@/components/channels/channel-icon";
import { ChannelTooltip } from "@/components/channels/channel-tooltip";
import { Button } from "@/components/ui/button";
import { LabelInput } from "@/components/ui/label-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPost, uploadMedia, deleteMedia, errorMessage } from "@/lib/api";
import { queries, refreshPosts, mutationKeys } from "@/lib/query";
import { authClient } from "@/lib/auth-client";
import { PageHeading } from "@/components/workspace/common";
import { Icon } from "@/components/ui/icon";
export default function CreatePage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    accounts = useQuery(queries.accounts()),
    { data: session } = authClient.useSession();
  const [text, setText] = useState(""),
    [providers, setProviders] = useState<Platform[]>([]),
    [scheduled, setScheduled] = useState(!!params.get("date"));
  const [when, setWhen] = useState(
      params.get("date") ? `${params.get("date")}T12:00` : "",
    ),
    [files, setFiles] = useState<File[]>([]);
  const mutation = useMutation({
    mutationKey: mutationKeys.createPost,
    mutationFn: async () => {
      if (!providers.length)
        throw new Error("Choose at least one connected channel.");
      if (
        providers.some(
          (provider) =>
            getChannel(provider)?.locked ||
            !accounts.data?.some((account) => account.providerId === provider),
        )
      )
        throw new Error(
          "A selected channel is locked or disconnected. Update your selection.",
        );
      if (!text.trim() && !files.length)
        throw new Error("Add a little text or an image first.");
      if (providers.includes("twitter") && text.length > 280)
        throw new Error("X posts must be 280 characters or fewer.");
      if (providers.includes("linkedin") && text.length > 3000)
        throw new Error("LinkedIn posts must be 3,000 characters or fewer.");
      if (scheduled && (!when || new Date(when).getTime() <= Date.now()))
        throw new Error("Choose a date and time in the future.");
      const mediaKeys: string[] = [];
      try {
        for (const file of files) mediaKeys.push(await uploadMedia(file));
      } catch (e) {
        await Promise.allSettled(mediaKeys.map(deleteMedia));
        throw e;
      }
      // Once submitted, the server may already have queued jobs even if the response fails.
      // Keep their media intact; only clean up uploads that fail before submission.
      return createPost({
        text: text.trim(),
        providers,
        mediaKeys,
        scheduleAt: scheduled ? new Date(when).toISOString() : undefined,
      });
    },
    onSuccess: async () => {
      await refreshPosts();
      toast.success(
        scheduled
          ? "Your idea has a date. Post scheduled!"
          : "Your post is on its way!",
      );
      navigate(scheduled ? "/schedule" : "/posts");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }
  const connected = (provider: string) =>
    accounts.data?.some((a) => a.providerId === provider);
  return (
    <>
      <PageHeading
        title="What’s on your mind?"
        description="One little idea can go a long way."
      />
      <form
        onSubmit={submit}
        className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]"
      >
        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Pick your people.</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Choose where this idea belongs.
            </p>
          </header>
          <div className="min-w-0 space-y-6">
            <FieldSet>
              <FieldLegend className="sr-only">Publishing channels</FieldLegend>
              <div
                className="flex flex-wrap gap-3"
                role="group"
                aria-label="Select publishing channels"
              >
                {CHANNELS.map((channel) => {
                  const isConnected = !!connected(channel.id);
                  const selected =
                    isPublishingPlatform(channel.id) &&
                    providers.includes(channel.id);
                  const disabled =
                    channel.locked ||
                    !isConnected ||
                    !isPublishingPlatform(channel.id) ||
                    mutation.isPending ||
                    accounts.isPending ||
                    accounts.isError;
                  const label = channel.locked
                    ? `${channel.name} — locked, coming soon`
                    : !isConnected
                      ? `${channel.name} — connect this channel first`
                      : `Publish to ${channel.name}`;
                  return (
                    <ChannelTooltip key={channel.id} label={label}>
                      <Button
                        type="button"
                        variant={selected ? "secondary" : "ghost"}
                        className="size-14 rounded-xl disabled:opacity-100"
                        aria-label={label}
                        aria-pressed={selected}
                        disabled={disabled}
                        onClick={() => {
                          if (
                            channel.locked ||
                            !isConnected ||
                            !isPublishingPlatform(channel.id)
                          )
                            return;
                          const provider = channel.id;
                          setProviders((current) =>
                            current.includes(provider)
                              ? current.filter((item) => item !== provider)
                              : [...current, provider],
                          );
                        }}
                      >
                        <ChannelIcon
                          channel={channel}
                          connected={isConnected}
                          size={28}
                        />
                      </Button>
                    </ChannelTooltip>
                  );
                })}
              </div>
            </FieldSet>
            {accounts.isSuccess &&
              !accounts.data.some((account) =>
                CHANNELS.some(
                  (channel) =>
                    !channel.locked && channel.id === account.providerId,
                ),
              ) && (
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link to="/connections" />}
                >
                  Connect a channel <Icon name="arrow" />
                </Button>
              )}
            {accounts.isError && (
              <Alert variant="destructive">
                <AlertDescription>Connections couldn’t load.</AlertDescription>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => accounts.refetch()}
                >
                  Try again
                </Button>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="post-text">Your post</FieldLabel>
              <Textarea
                id="post-text"
                placeholder="A fresh idea. A little behind the scenes. Something worth sharing…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={3000}
                rows={8}
                className="min-h-48 resize-y text-sm leading-7"
                disabled={mutation.isPending}
              />
              <FieldDescription className="text-right">
                {text.length} / {providers.includes("twitter") ? 280 : 3000}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="post-images">
                <Icon name="image" size={16} />
                Add images
              </FieldLabel>
              <LabelInput
                id="post-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={mutation.isPending}
                onChange={(e) => {
                  const next = Array.from(e.target.files || []);
                  if (
                    next.length > 4 ||
                    next.some((f) => f.size > 10 * 1024 * 1024)
                  ) {
                    toast.error("Choose up to 4 images, each under 10 MB.");
                    e.target.value = "";
                    return;
                  }
                  setFiles(next);
                }}
              />
              <FieldDescription>
                Up to 4 images, each under 10 MB.
              </FieldDescription>
            </Field>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div
                    className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1"
                    key={`${file.name}-${i}`}
                  >
                    <Icon name="image" size={14} />
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${file.name}`}
                      disabled={mutation.isPending}
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, index) => index !== i),
                        )
                      }
                    >
                      <Icon name="close" size={13} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="schedule-post">Give it a date</FieldLabel>
                <FieldDescription>
                  Plan ahead. Make space to create.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="schedule-post"
                checked={scheduled}
                onCheckedChange={setScheduled}
                disabled={mutation.isPending}
              />
            </Field>
            {scheduled && (
              <Field>
                <LabelInput
                  label="Your local date and time"
                  id="schedule-at"
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  required
                  disabled={mutation.isPending}
                />
              </Field>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="w-full"
              disabled={mutation.isPending || accounts.isPending}
            >
              {mutation.isPending
                ? "Sending your idea…"
                : scheduled
                  ? "Schedule this post"
                  : "Publish your post"}
              <Icon name={scheduled ? "calendar" : "send"} />
            </Button>
          </div>
        </section>
        <aside className="space-y-4">
          <Badge variant="outline">A LITTLE PREVIEW</Badge>
          <section className="flex min-w-0 flex-col gap-4">
            <header className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={session?.user.image || undefined} />
                  <AvatarFallback>
                    {session?.user.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {session?.user.name}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Just now · Your next great post
                  </p>
                </div>
                <Icon name="more" size={16} />
              </div>
            </header>
            <div className="min-w-0">
              <p className="min-h-24 whitespace-pre-wrap break-words text-xs leading-6">
                {text || "Your words go here. Make them yours."}
              </p>
              {files.length > 0 && (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-md bg-muted p-6 text-muted-foreground">
                  <Icon name="image" size={32} />
                  <span className="text-xs">
                    {files.length} image{files.length > 1 ? "s" : ""} attached
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 border-t text-[10px] text-muted-foreground">
              Your voice. Your people. Your moment.
            </div>
          </section>
          <p className="flex gap-2 text-[10px] leading-5 text-muted-foreground">
            <Icon name="shield" size={15} className="shrink-0" />
            Only publishes to the channels you choose. Final appearance varies
            by platform.
          </p>
        </aside>
      </form>
    </>
  );
}

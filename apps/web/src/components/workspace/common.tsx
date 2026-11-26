import LatticeLoader, {
  type LatticeLoaderProps,
} from "@/components/LatticeLoader";
import { CreatePostButton } from "@/components/posts/composer";
import { PostVisual } from "@/components/posts/post-media";
import { cn } from "cn";

import { getChannel } from "@/lib/constants";
import type {
  PageHeadingProps,
  Post,
  PostListProps,
  QueryStateProps,
} from "@/lib/types";

import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Icon } from "../ui/icon";
import { Skeleton } from "../ui/skeleton";

export function PageHeading({
  title,
  description,
  children,
}: PageHeadingProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="space-y-1">
        <h1 className="heading">{title}</h1>
        {description && (
          <p className="subheading mt-2 max-w-md!">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function LoadingIndicator({
  label = "Loading",
  ...props
}: LatticeLoaderProps) {
  return (
    <LatticeLoader
      status="working"
      label={label}
      doneLabel="Done in"
      errorLabel="Failed after"
      pattern="sweep"
      grid={4}
      shape="square"
      doneColor="#22c55e"
      errorColor="#ef4444"
      cellSize={6}
      gap={2}
      fontSize={14}
      step={90}
      idleOpacity={0.15}
      glow={false}
      glowColor=""
      showTimer
      color="currentColor"
      className="text-foreground"
      {...props}
    />
  );
}
export function QueryState({
  pending,
  error,
  retry,
  loadingLabel = "Loading your content",
}: QueryStateProps) {
  if (pending)
    return (
      <section
        role="status"
        aria-label={loadingLabel}
        aria-busy="true"
        className="flex min-w-0 flex-col gap-2"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            key={index}
            aria-hidden="true"
            className="h-[60px] rounded-2xl motion-reduce:animate-none"
          />
        ))}
      </section>
    );

  if (error)
    return (
      <section className="flex min-w-0 flex-col gap-4">
        <Empty role="alert">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon name="link" />
            </EmptyMedia>
            <EmptyTitle className="heading w-full!">We couldn’t load this just yet.</EmptyTitle>
            <EmptyDescription className="subheading text-xl! max-w-[280px]! mt-4">
              Check that the API is running and try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </section>
    );
  return null;
}
const STATUS = {
  scheduled: { label: "Scheduled", tone: "text-muted-foreground" },
  posting: { label: "Posting…", tone: "text-amber-600 dark:text-amber-400" },
  posted: { label: "Posted", tone: "text-lime-600 dark:text-lime-400" },
  failed: { label: "Failed", tone: "text-destructive" },
};

export const postState = (post: Post) =>
  post.status === "SUCCESS"
    ? "posted"
    : post.status === "FAILED"
      ? "failed"
      : post.isScheduled
        ? "scheduled"
        : "posting";

const whenOf = (post: Post) =>
  new Date(post.scheduledFor || post.createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function PostRow({ post }: { post: Post }) {
  const status = STATUS[postState(post)];
  return (
    <li className="flex items-center gap-4 rounded-2xl p-1.5 pr-4 transition-colors hover:bg-secondary/40 hover:ring-1 hover:ring-secondary">
      <PostVisual post={post} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {post.text ||
            (post.mediaKeys.length ? "A picture worth sharing" : "Empty post")}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{getChannel(post.provider)?.name ?? post.provider}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{whenOf(post)}</span>
        </p>
      </div>
      <span className={cn("shrink-0 text-xs", status.tone)}>
        {status.label}
      </span>
    </li>
  );
}

export function PostList({
  posts,
  compact = false,
  empty = "Create your first post and start a little momentum.",
}: PostListProps) {
  if (!posts.length)
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-20 text-center">
        <Icon name="layers" size={32} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{empty}</p>
        <CreatePostButton />
      </div>
    );
  return (
    <ul className="space-y-1">
      {posts.slice(0, compact ? 5 : undefined).map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
    </ul>
  );
}

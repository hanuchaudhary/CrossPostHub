import LatticeLoader, {
  type LatticeLoaderProps,
} from "@/components/LatticeLoader";
import { CreatePostButton } from "@/components/posts/composer";
import type {
  PageHeadingProps,
  PostListProps,
  QueryStateProps,
} from "@/lib/types";

import { Badge } from "../ui/badge";
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
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export function PageHeading({
  title,
  description,
  children,
}: PageHeadingProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="space-y-1">
        <h1 className="heading text-3xl!">{title}</h1>
        {description && (
          <p className="subheading text-lg! mt-3">{description}</p>
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
        className="flex min-w-0 flex-col gap-4"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex items-center gap-4 rounded-xl border p-5"
          >
            <Skeleton className="size-10 shrink-0 rounded-lg motion-reduce:animate-none" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-3 w-1/3 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-4/5 motion-reduce:animate-none" />
            </div>
          </div>
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
export function PostList({ posts, compact = false }: PostListProps) {
  if (!posts.length)
    return (
      <Empty className="min-h-72">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="layers" />
          </EmptyMedia>
          <EmptyTitle>Your next idea belongs here.</EmptyTitle>
          <EmptyDescription>
            Create your first post and start a little momentum.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreatePostButton />
        </EmptyContent>
      </Empty>
    );
  return (
    <Table>
      <TableBody>
        {posts.slice(0, compact ? 5 : undefined).map((post) => (
          <TableRow key={post.id}>
            <TableCell className="w-12 pl-4">
              <div className="flex size-8 items-center justify-center rounded-md border bg-background">
                <Icon name={post.provider} size={18} />
              </div>
            </TableCell>
            <TableCell className="max-w-40 sm:max-w-sm">
              <p className="truncate text-xs font-medium">
                {post.text || "A picture worth sharing"}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {post.provider === "twitter" ? "X / Twitter" : post.provider} ·{" "}
                {new Date(post.scheduledFor || post.createdAt).toLocaleString(
                  [],
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </TableCell>
            <TableCell className="pr-4 text-right">
              <Badge
                variant={
                  post.status === "FAILED"
                    ? "destructive"
                    : post.status === "SUCCESS"
                      ? "default"
                      : "secondary"
                }
              >
                {post.status === "SUCCESS"
                  ? "Published"
                  : post.status === "FAILED"
                    ? "Failed"
                    : post.isScheduled
                      ? "Scheduled"
                      : "Processing"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

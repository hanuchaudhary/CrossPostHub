import { Link } from "react-router";

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
import { Spinner } from "../ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export function PageHeading({
  title,
  description,
  children,
}: PageHeadingProps) {
  !title && null;
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="space-y-1">
        <h1 className="text-3xl">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function LoadingIndicator() {
  return <Spinner className="size-5" />;
}
export function QueryState({ pending, error, retry }: QueryStateProps) {
  if (pending)
    return (
      <section className="flex min-w-0 flex-col gap-4">
        <Empty role="status">
          <EmptyMedia>
            <LoadingIndicator />
          </EmptyMedia>
          <EmptyDescription>Gathering your latest ideas…</EmptyDescription>
        </Empty>
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
            <EmptyTitle>We couldn’t load this just yet.</EmptyTitle>
            <EmptyDescription>
              Check that the API is running and try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={retry}>
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
          <Button nativeButton={false} render={<Link to="/create" />}>
            <Icon name="plus" />
            Create a post
          </Button>
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

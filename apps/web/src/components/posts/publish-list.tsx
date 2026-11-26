import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { addDays, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { QueryState } from "@/components/workspace/common";
import { getChannel } from "@/lib/constants";
import { queries } from "@/lib/query";
import type { Post } from "@/lib/types";

import { useComposer } from "./composer";
import { MediaGrid } from "./post-media";

const dateKey = (date: Date) => startOfDay(date).getTime();
const timeLabel = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

function suggestedSlots(day: Date, now: Date) {
  const seed =
    (day.getFullYear() * 31 + day.getMonth() * 7 + day.getDate() * 13) % 12;
  const minutes =
    dateKey(day) === dateKey(now)
      ? (() => {
          const next = now.getHours() * 60 + now.getMinutes() + 1;
          const remaining = 1439 - next;
          if (remaining < 0) return [];
          if (remaining === 0) return [next];
          return [
            next + Math.min(14, Math.floor(remaining / 3)),
            next + Math.min(89, remaining),
          ];
        })()
      : [9 * 60 + seed * 15, 15 * 60 + ((seed + 5) % 12) * 15];
  return minutes.map((minute) => {
    const slot = new Date(day);
    slot.setHours(0, minute, 0, 0);
    return slot;
  });
}

const statuses = {
  pending: "PENDING",
  sent: "SUCCESS",
  failed: "FAILED",
} as const;
type PublishFilter = keyof typeof statuses;

export function PublishList({ now }: { now: Date }) {
  const open = useComposer();
  const [filter, setFilter] = useState<PublishFilter>("pending");
  const posts = useQuery(queries.posts());
  const [visibleDays, setVisibleDays] = useState(10);
  const sentinel = useRef<HTMLDivElement>(null);
  const groups = {
    pending: (posts.data ?? []).filter((post) => post.status === "PENDING"),
    sent: (posts.data ?? []).filter((post) => post.status === "SUCCESS"),
    failed: (posts.data ?? []).filter((post) => post.status === "FAILED"),
  };
  const rows = groups[filter];
  const hasData = posts.data !== undefined;
  useEffect(() => {
    const target = sentinel.current;
    if (
      filter !== "pending" ||
      !target ||
      !hasData ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisibleDays((count) => count + 10);
      },
      {
        root: target.closest<HTMLElement>('[data-slot="sidebar-inset"]'),
        rootMargin: "240px 0px",
      }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filter, visibleDays, hasData]);
  const postDate = (post: Post) =>
    new Date(post.scheduledFor ?? post.createdAt);
  const days = !posts.data
    ? []
    : filter === "pending"
      ? Array.from({ length: visibleDays }, (_, index) =>
          startOfDay(addDays(now, index))
        )
      : [
          ...new Map(
            rows.map((post) => {
              const day = startOfDay(postDate(post));
              return [dateKey(day), day] as const;
            })
          ).values(),
        ].sort((a, b) => b.getTime() - a.getTime());
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          label="Post status"
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setVisibleDays(10);
          }}
          options={(["pending", "sent", "failed"] as const).map((key) => ({
            key,
            label: LABELS[key],
            count: posts.data ? groups[key].length : undefined,
          }))}
        />
        {filter === "pending" && (
          <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:block">
            Next {visibleDays} days
          </span>
        )}
      </div>
      <div role="tabpanel">
        <QueryState
          loadingLabel="Loading your posts"
          pending={posts.isPending}
          error={!posts.data ? posts.error : null}
          retry={() => posts.refetch()}
        />
        {hasData && filter !== "pending" && rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-20 text-center">
            <Icon
              name={filter === "sent" ? "send" : "check"}
              size={32}
              className="text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              {filter === "sent"
                ? "No published posts yet."
                : "No failed posts. Nice."}
            </p>
          </div>
        )}
        <div className="space-y-4">
          {days.map((day) => {
            const daily = rows.filter(
              (post) => dateKey(postDate(post)) === dateKey(day)
            );
            const slots =
              filter === "pending" && dateKey(day) >= dateKey(now)
                ? suggestedSlots(day, now)
                : [];
            const entries: (
              | { date: Date; post: Post; key: string }
              | { date: Date; post?: undefined; key: string }
            )[] = [
              ...daily.map((post) => ({
                date: postDate(post),
                post,
                key: post.id,
              })),
              ...slots.map((date) => ({ date, key: `slot-${date.getTime()}` })),
            ];
            entries.sort((a, b) =>
              filter === "pending"
                ? a.date.getTime() - b.date.getTime()
                : b.date.getTime() - a.date.getTime()
            );
            const today = dateKey(day) === dateKey(now);
            const label = today
              ? "Today"
              : dateKey(day) === dateKey(addDays(now, 1))
                ? "Tomorrow"
                : day.toLocaleDateString([], { weekday: "long" });
            return (
              <section
                key={day.toISOString()}
                aria-label={`${label}, ${day.toLocaleDateString()}`}
                className="rounded-2xl bg-popover p-1 ring-1 ring-foreground/10"
              >
                <header className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5 shadow ring-2 ring-muted">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg text-sm font-medium tabular-nums",
                      today
                        ? "bg-brand text-brand-foreground"
                        : "bg-background ring-1 ring-border"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">{label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {day.toLocaleDateString([], {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {daily.length > 0 && (
                    <span className="ml-auto min-w-5 rounded-full bg-background px-1.5 text-center text-[11px] leading-5 text-muted-foreground tabular-nums">
                      {daily.length}
                    </span>
                  )}
                </header>
                <ul className="space-y-1 p-2">
                  {entries.length === 0 && (
                    <li className="px-3 py-4 text-sm text-muted-foreground">
                      {filter === "pending"
                        ? "No more time slots today."
                        : "Nothing on this day."}
                    </li>
                  )}
                  {entries.map(({ date, post, key }) => (
                    <li
                      key={key}
                      className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[80px_minmax(0,1fr)]"
                    >
                      <time
                        dateTime={date.toISOString()}
                        className={cn(
                          "text-xs text-muted-foreground tabular-nums",
                          post ? "pt-4" : "pt-3"
                        )}
                      >
                        {timeLabel(date)}
                      </time>
                      {post ? (
                        <PostCard post={post} />
                      ) : (
                        <button
                          type="button"
                          className="group flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 text-sm text-muted-foreground transition-colors outline-none hover:border-foreground/30 hover:bg-secondary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                          onClick={() => {
                            if (date > new Date()) open(date);
                          }}
                          aria-label={`New post ${date.toLocaleDateString()} at ${timeLabel(date)}`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon name="plus" size={14} />
                            New post
                          </span>
                          <Icon
                            name="arrow"
                            size={16}
                            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                          />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        {posts.data && filter === "pending" && (
          <div
            ref={sentinel}
            className="flex min-h-20 items-center justify-center"
          >
            <Button
              variant="ghost"
              onClick={() => setVisibleDays((count) => count + 10)}
            >
              Show 10 more days
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const LABELS: Record<PublishFilter, string> = {
  pending: "Upcoming",
  sent: "Posted",
  failed: "Failed",
};

function PostCard({ post }: { post: Post }) {
  const status =
    post.status === "SUCCESS"
      ? { label: "Posted", tone: "text-lime-600 dark:text-lime-400" }
      : post.status === "FAILED"
        ? { label: "Failed", tone: "text-destructive" }
        : post.isScheduled
          ? { label: "Scheduled", tone: "text-muted-foreground" }
          : { label: "Posting…", tone: "text-amber-600 dark:text-amber-400" };
  return (
    <article className="min-w-0 space-y-3 rounded-2xl p-3 ring-1 ring-border transition-colors hover:bg-secondary/40">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="grid size-6 place-items-center rounded-md bg-secondary">
            <Icon name={post.provider} size={14} />
          </span>
          {getChannel(post.provider)?.name}
        </span>
        <span className={cn("text-xs", status.tone)}>{status.label}</span>
      </div>
      {post.text && (
        <p className="line-clamp-4 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {post.text}
        </p>
      )}
      <MediaGrid keys={post.mediaKeys} />
    </article>
  );
}

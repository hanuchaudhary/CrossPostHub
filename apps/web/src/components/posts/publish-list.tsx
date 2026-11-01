import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryState } from "@/components/workspace/common";
import { getChannel } from "@/lib/constants";
import { queries } from "@/lib/query";
import type { Post } from "@/lib/types";

import { useComposer } from "./composer";

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
    <Tabs
      value={filter}
      onValueChange={(value) => {
        if (value === "pending" || value === "sent" || value === "failed") {
          setFilter(value);
          setVisibleDays(10);
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList variant="line" aria-label="Post status">
          {(["pending", "sent", "failed"] as const).map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className="px-3 py-2 capitalize"
            >
              {value}
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                {posts.data ? groups[value].length : 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {filter === "pending" && (
          <span className="hidden shrink-0 rounded-full border px-3 py-1.5 text-[10px] text-muted-foreground sm:block">
            Next {visibleDays} days
          </span>
        )}
      </div>
      <TabsContent value={filter} className="mx-auto w-full py-7 sm:py-10">
        <QueryState
          loadingLabel="Loading your posts"
          pending={posts.isPending}
          error={!posts.data ? posts.error : null}
          retry={() => posts.refetch()}
        />
        {hasData && filter !== "pending" && rows.length === 0 && (
          <div className="rounded-xl border border-dashed px-6 py-14 text-center">
            <Icon
              name={filter === "sent" ? "send" : "check"}
              className="mx-auto mb-3 text-muted-foreground"
              size={24}
            />
            <p className="text-sm text-muted-foreground">
              {filter === "sent"
                ? "No published posts yet."
                : "No failed posts."}
            </p>
          </div>
        )}
        <div>
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
                className="grid gap-4 border-t py-6 first:border-t-0 first:pt-0 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-7"
              >
                <header className="flex items-center gap-3 self-start sm:sticky sm:top-4">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-medium ${today ? "bg-primary text-primary-foreground" : "border bg-muted/25"}`}
                  >
                    {day.getDate()}
                  </div>
                  <div>
                    <h3 className="text-xs font-medium">{label}</h3>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {day.toLocaleDateString([], {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </header>
                <div className="space-y-3">
                  {entries.length === 0 && (
                    <p className="rounded-xl border border-dashed px-4 py-5 text-xs text-muted-foreground">
                      {filter === "sent"
                        ? "No published posts on this day."
                        : filter === "failed"
                          ? "No failed posts on this day."
                          : "No more time slots today."}
                    </p>
                  )}
                  {entries.map(({ date, post, key }) => (
                    <div
                      key={key}
                      className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[85px_minmax(0,1fr)]"
                    >
                      <time
                        dateTime={date.toISOString()}
                        className="pt-4 text-[11px] tabular-nums text-muted-foreground"
                      >
                        {timeLabel(date)}
                      </time>
                      {post ? (
                        <article className="min-w-0 rounded-xl border bg-background p-4 shadow-xs">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-xs font-medium">
                              <Icon name={post.provider} size={16} />
                              {getChannel(post.provider)?.name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] ${post.status === "FAILED" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
                            >
                              {post.status === "SUCCESS"
                                ? "Published"
                                : post.status === "FAILED"
                                  ? "Failed"
                                  : post.isScheduled
                                    ? "Scheduled"
                                    : "Processing"}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {post.text || "Media post"}
                          </p>
                          {post.mediaKeys.length > 0 && (
                            <p className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Icon name="image" size={12} />
                              {post.mediaKeys.length} image
                              {post.mediaKeys.length === 1 ? "" : "s"}
                            </p>
                          )}
                        </article>
                      ) : (
                        <Button
                          variant="ghost"
                          className="group h-12 w-full justify-between rounded-xl border border-dashed bg-muted/15 px-4 text-muted-foreground hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground"
                          onClick={() => {
                            if (date > new Date()) open(date);
                          }}
                          aria-label={`New post ${date.toLocaleDateString()} at ${timeLabel(date)}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="flex size-5 items-center justify-center rounded-full border bg-background">
                              <Icon name="plus" size={12} />
                            </span>
                            New post
                          </span>
                          <Icon
                            name="arrow"
                            className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
      </TabsContent>
    </Tabs>
  );
}

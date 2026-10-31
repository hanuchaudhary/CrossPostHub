import { useState } from "react";

import { addDays, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getChannel } from "@/lib/constants";
import type { Post } from "@/lib/types";

import { useComposer } from "./composer";

const dateKey = (date: Date) => startOfDay(date).getTime();
const timeLabel = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// Keep suggestions stable for each date; today's suggestions always stay ahead of now.
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

export function PublishList({ posts, now }: { posts: Post[]; now: Date }) {
  const open = useComposer();
  const [filter, setFilter] = useState("queue");
  const groups = {
    queue: posts.filter((post) => post.status === "PENDING"),
    sent: posts.filter((post) => post.status === "SUCCESS"),
    failed: posts.filter((post) => post.status === "FAILED"),
  };
  const rows = groups[filter as keyof typeof groups];
  const postDate = (post: Post) =>
    new Date(post.scheduledFor ?? post.createdAt);
  const dates = new Map<number, Date>();
  if (filter === "queue")
    for (let i = 0; i < 7; i++) {
      const day = startOfDay(addDays(now, i));
      dates.set(dateKey(day), day);
    }
  for (const post of rows)
    dates.set(dateKey(postDate(post)), startOfDay(postDate(post)));
  const days = [...dates.values()].sort((a, b) =>
    filter === "queue" ? a.getTime() - b.getTime() : b.getTime() - a.getTime()
  );
  return (
    <Tabs value={filter} onValueChange={(value) => setFilter(String(value))}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
        <TabsList variant="line" aria-label="Post status">
          {(["queue", "sent", "failed"] as const).map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className="px-3 py-2 capitalize"
            >
              {value}
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                {groups[value].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="clock" />
          {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </span>
      </div>
      <TabsContent
        value={filter}
        className="mx-auto w-full max-w-5xl py-7 sm:py-10"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight">
              {filter === "queue"
                ? "Make room for your next idea."
                : filter === "sent"
                  ? "Out in the world."
                  : "Needs your attention."}
            </h2>
            <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
              {filter === "queue"
                ? "Pick a time below to start a post. You can adjust it in the composer."
                : filter === "sent"
                  ? "Your published posts, one day at a time."
                  : "Review the posts that couldn’t be published."}
            </p>
          </div>
          {filter === "queue" && (
            <span className="hidden shrink-0 rounded-full border px-3 py-1.5 text-[10px] text-muted-foreground sm:block">
              Next 7 days
            </span>
          )}
        </div>
        {!days.length && (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <Icon
              name={filter === "sent" ? "send" : "check"}
              className="mx-auto mb-3 text-muted-foreground"
              size={24}
            />
            <p className="text-sm text-muted-foreground">
              {filter === "sent"
                ? "Your published posts will appear here."
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
              filter === "queue" && dateKey(day) >= dateKey(now)
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
              filter === "queue"
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
      </TabsContent>
    </Tabs>
  );
}

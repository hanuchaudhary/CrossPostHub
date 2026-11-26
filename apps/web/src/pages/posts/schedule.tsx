import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { useQuery } from "@tanstack/react-query";
import { addDays, addMonths, startOfMonth, startOfWeek } from "date-fns";

import { cn } from "cn";

import { CalendarDayDialog } from "@/components/posts/calendar-day-dialog";
import { CreatePostButton, useComposer } from "@/components/posts/composer";
import { MediaThumb } from "@/components/posts/post-media";
import { PublishList } from "@/components/posts/publish-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryState } from "@/components/workspace/common";
import { queries } from "@/lib/query";
import type { Post } from "@/lib/types";

import { PageLayout } from "../page-layout";

const VISIBLE_CHIPS = 3;
const DEFAULT_HOUR = 10;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function monthGrid(month: Date) {
  const start = startOfWeek(startOfMonth(month));
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const days: Date[] = [];
  for (let at = start; at <= last || at.getDay() !== 0; at = addDays(at, 1))
    days.push(at);
  return days;
}

const postDate = (post: Post) => new Date(post.scheduledFor ?? post.createdAt);

const timeOf = (date: Date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** Today: the next half hour. Future days: 10:00. */
function startFor(day: Date) {
  if (startOfDay(new Date()).getTime() !== day.getTime())
    return new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      DEFAULT_HOUR
    );
  const next = new Date();
  next.setMinutes(next.getMinutes() + 30, 0, 0);
  return next;
}

export default function SchedulePage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "list" ? "list" : "calendar";
  const [now, setNow] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const posts = useQuery({ ...queries.posts(), enabled: tab === "calendar" });
  const [picked, setPicked] = useState<Date | null>(null);
  const open = useComposer();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<string, { post: Post; at: Date }[]>();
    for (const post of posts.data ?? []) {
      const at = postDate(post);
      const key = dayKey(at);
      map.set(key, [...(map.get(key) ?? []), { post, at }]);
    }
    for (const list of map.values())
      list.sort((a, b) => a.at.getTime() - b.at.getTime());
    return map;
  }, [posts.data]);

  const today = startOfDay(now);
  const days = monthGrid(month);
  const thisMonth = startOfMonth(today).getTime() === month.getTime();

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (value === "calendar") {
          setMonth(startOfMonth(new Date()));
          setNow(new Date());
        }
        setParams((current) => {
          const next = new URLSearchParams(current);
          next.set("tab", String(value));
          return next;
        });
      }}
    >
      <PageLayout
        title="Publish"
        description="Pick a day to schedule a post, and see everything planned."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <TabsList
              aria-label="Publishing view"
              className="rounded-lg border p-1 group-data-horizontal/tabs:h-9"
            >
              <TabsTrigger value="list" className="rounded-md px-3">
                <Icon name="layers" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-md px-3">
                <Icon name="calendar" />
                Calendar
              </TabsTrigger>
            </TabsList>
            <CreatePostButton />
          </div>
        }
      >
        <TabsContent value="list">
          <PublishList now={now} />
        </TabsContent>
        <TabsContent value="calendar">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium tabular-nums">
              {month.toLocaleDateString([], { month: "long", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={thisMonth}
                onClick={() => setMonth(startOfMonth(new Date()))}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous month"
                onClick={() => setMonth((current) => addMonths(current, -1))}
              >
                <Icon name="back" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next month"
                onClick={() => setMonth((current) => addMonths(current, 1))}
              >
                <Icon name="arrow" />
              </Button>
            </div>
          </div>
          <QueryState
            loadingLabel="Loading your calendar"
            pending={posts.isPending}
            error={posts.error}
            retry={() => posts.refetch()}
          />
          {posts.data !== undefined && (
            <section
              aria-label="Publishing calendar"
              className="flex h-[calc(100dvh-18rem)] min-h-[560px] flex-col"
            >
              <div className="grid grid-cols-7 border-b pb-2 text-center text-xs text-muted-foreground">
                {days.slice(0, 7).map((day) => (
                  <span key={day.getDay()}>
                    {day.toLocaleDateString([], { weekday: "short" })}
                  </span>
                ))}
              </div>
              <div
                className="grid min-h-0 flex-1 grid-cols-7 border-l"
                style={{
                  gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))`,
                }}
              >
                {days.map((day) => {
                  const inMonth = day.getMonth() === month.getMonth();
                  const isToday = day.getTime() === today.getTime();
                  const upcoming = day >= today;
                  const entries = byDay.get(dayKey(day)) ?? [];
                  const viewable = upcoming || entries.length > 0;
                  const label = day.toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  });
                  return (
                    <button
                      key={dayKey(day)}
                      type="button"
                      disabled={!viewable}
                      onClick={() =>
                        entries.length ? setPicked(day) : open(startFor(day))
                      }
                      aria-label={
                        entries.length
                          ? `See ${entries.length} post${entries.length === 1 ? "" : "s"} on ${label}`
                          : upcoming
                            ? `Schedule a post on ${label}`
                            : `${label}, this day has passed`
                      }
                      title={viewable ? undefined : "This day has passed"}
                      className={cn(
                        "group relative flex min-h-0 flex-col gap-1 overflow-hidden border-r border-b p-1.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:p-2",
                        !upcoming && "bg-secondary/30",
                        viewable
                          ? "cursor-pointer hover:bg-secondary/60"
                          : "cursor-not-allowed"
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span
                          className={cn(
                            "grid size-6 place-items-center rounded-full text-xs tabular-nums",
                            isToday && "bg-brand text-brand-foreground",
                            !isToday && !upcoming && "text-muted-foreground/60",
                            !isToday &&
                              upcoming &&
                              !inMonth &&
                              "text-muted-foreground"
                          )}
                        >
                          {day.getDate()}
                        </span>
                        {upcoming && (
                          <Icon
                            name="plus"
                            size={16}
                            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          />
                        )}
                      </span>

                      <span className="flex flex-wrap gap-0.5 md:hidden">
                        {entries.slice(0, 4).map(({ post }) => (
                          <Icon
                            key={post.id}
                            name={post.provider}
                            size={14}
                            className={cn(
                              post.status === "FAILED" && "opacity-50"
                            )}
                          />
                        ))}
                      </span>
                      <span className="hidden min-h-0 flex-col gap-0.5 md:flex">
                        {entries.slice(0, VISIBLE_CHIPS).map(({ post, at }) => (
                          <span
                            key={post.id}
                            title={post.text || "Media post"}
                            className={cn(
                              "flex items-center gap-1.5 truncate rounded-md bg-background px-1.5 py-0.5 text-[11px] ring-1 ring-border",
                              post.status === "FAILED" &&
                                "text-destructive ring-destructive/40",
                              post.status === "SUCCESS" &&
                                "text-muted-foreground"
                            )}
                          >
                            {post.mediaKeys[0] ? (
                              <MediaThumb
                                mediaKey={post.mediaKeys[0]}
                                className="size-4 shrink-0 rounded-sm ring-0"
                              />
                            ) : (
                              <Icon
                                name={post.provider}
                                size={12}
                                className="shrink-0"
                              />
                            )}
                            <span className="tabular-nums">{timeOf(at)}</span>
                            <span className="truncate">
                              {post.text || "Media post"}
                            </span>
                          </span>
                        ))}
                        {entries.length > VISIBLE_CHIPS && (
                          <span className="px-1.5 text-[11px] text-muted-foreground">
                            +{entries.length - VISIBLE_CHIPS} more
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
          <CalendarDayDialog
            day={picked}
            posts={
              picked
                ? (byDay.get(dayKey(picked)) ?? []).map((entry) => entry.post)
                : []
            }
            canSchedule={!!picked && picked >= today}
            onSchedule={() => {
              if (!picked) return;
              const at = startFor(picked);
              setPicked(null);
              open(at);
            }}
            onOpenChange={(next) => {
              if (!next) setPicked(null);
            }}
          />
        </TabsContent>
      </PageLayout>
    </Tabs>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { useQuery } from "@tanstack/react-query";
import { addDays, addMonths, startOfMonth, startOfWeek } from "date-fns";

import { CreatePostButton, useComposer } from "@/components/posts/composer";
import { PublishList } from "@/components/posts/publish-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageHeading,
  PostList,
  QueryState,
} from "@/components/workspace/common";
import { queries } from "@/lib/query";

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
export default function SchedulePage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "list" ? "list" : "calendar";
  const [now, setNow] = useState(() => new Date());
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [view, setView] = useState<"month" | "week">("week");
  const posts = useQuery(queries.posts());
  const open = useComposer();
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  const scheduled = (posts.data ?? []).filter(
    (p) => p.isScheduled && p.scheduledFor
  );
  const days = Array.from({ length: view === "week" ? 7 : 42 }, (_, i) =>
    addDays(
      view === "week" ? startOfWeek(anchor) : startOfWeek(startOfMonth(anchor)),
      i
    )
  );
  const dayPosts = (day: Date) =>
    scheduled.filter((p) => sameDay(new Date(p.scheduledFor!), day));
  function openDay(day: Date) {
    const date = new Date(day);
    date.setHours(12, 0, 0, 0);
    if (date <= new Date()) {
      const next = new Date();
      next.setMinutes(next.getMinutes() + 30, 0, 0);
      if (!sameDay(next, day)) return;
      open(next);
    } else open(date);
  }
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setParams((current) => {
          const next = new URLSearchParams(current);
          next.set("tab", String(value));
          return next;
        });
      }}
    >
      <PageHeading
        title="Publish"
        description="A little planning. More room to create."
      >
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
      </PageHeading>
      <TabsContent value="list">
        <QueryState
          pending={posts.isPending}
          error={posts.error}
          retry={() => posts.refetch()}
        />
        {posts.isSuccess && <PublishList posts={posts.data} now={now} />}
      </TabsContent>
      <TabsContent value="calendar">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous period"
              onClick={() =>
                setAnchor(
                  view === "week" ? addDays(anchor, -7) : addMonths(anchor, -1)
                )
              }
            >
              <Icon name="back" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next period"
              onClick={() =>
                setAnchor(
                  view === "week" ? addDays(anchor, 7) : addMonths(anchor, 1)
                )
              }
            >
              <Icon name="arrow" />
            </Button>
            <h2 className="mr-3 text-sm font-medium">
              {anchor.toLocaleDateString([], {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                setAnchor(today);
                setSelected(today);
                setNow(today);
              }}
            >
              Today
            </Button>
            <select
              aria-label="Calendar view"
              value={view}
              onChange={(e) => setView(e.target.value as "month" | "week")}
              className="rounded-md bg-background px-3 py-2 text-xs"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="clock" />
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>
        <QueryState
          pending={posts.isPending}
          error={posts.error}
          retry={() => posts.refetch()}
        />
        <section
          aria-label="Publishing calendar"
          className="overflow-x-auto rounded-xl border"
        >
          {view === "week" ? (
            <div className="max-h-[68vh] min-w-[780px] overflow-y-auto">
              <div className="sticky top-0 z-20 grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b bg-background">
                <div className="border-r" />
                {days.map((day) => (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelected(day)}
                    className={`border-r p-4 text-center text-xs last:border-r-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${sameDay(day, now) ? "border-b-2 border-b-primary bg-primary/5 text-foreground" : "text-muted-foreground"}`}
                  >
                    {day.toLocaleDateString([], { weekday: "long" })}
                    <span className="ml-2">{day.getDate()}</span>
                  </button>
                ))}
              </div>
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]"
                >
                  <div className="border-r border-b px-1 pt-2 text-right text-[10px] text-muted-foreground">
                    {new Date(2000, 0, 1, hour).toLocaleTimeString([], {
                      hour: "numeric",
                      hour12: true,
                    })}
                  </div>
                  {days.map((day) => {
                    const slot = new Date(day);
                    slot.setHours(hour, 0, 0, 0);
                    const past = slot.getTime() <= now.getTime();
                    const rows = dayPosts(day).filter(
                      (p) => new Date(p.scheduledFor!).getHours() === hour
                    );
                    return (
                      <div
                        key={slot.toISOString()}
                        className={`relative min-h-24 border-r border-b last:border-r-0 ${past ? "bg-muted/45" : ""}`}
                      >
                        <button
                          type="button"
                          disabled={past}
                          aria-label={`Schedule post ${slot.toLocaleString()}`}
                          className="group absolute inset-0 flex items-center justify-center outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          onClick={() => {
                            if (slot > new Date()) {
                              setSelected(day);
                              open(slot);
                            }
                          }}
                        >
                          {!past && (
                            <span className="rounded-full border bg-background p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-60">
                              <Icon name="plus" size={14} />
                            </span>
                          )}
                        </button>
                        {rows.map((post) => (
                          <div
                            key={post.id}
                            className="pointer-events-none relative z-10 m-1 rounded-md border bg-background p-2 text-[10px] shadow-sm"
                          >
                            <span className="flex items-center gap-1 font-medium">
                              <Icon name={post.provider} size={12} />
                              {new Date(post.scheduledFor!).toLocaleTimeString(
                                [],
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                            <p className="mt-1 truncate">
                              {post.text || "Media post"}
                            </p>
                          </div>
                        ))}
                        {sameDay(day, now) && now.getHours() === hour && (
                          <div
                            className="pointer-events-none absolute inset-x-0 z-10 border-t border-red-500"
                            style={{
                              top: `${(now.getMinutes() / 60) * 100}%`,
                            }}
                          >
                            <span className="absolute -top-1 left-0 size-2 rounded-full bg-red-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="min-w-[630px]">
              <div className="grid grid-cols-7 border-b">
                {days.slice(0, 7).map((day) => (
                  <div
                    key={day.toISOString()}
                    className="p-3 text-center text-xs text-muted-foreground"
                  >
                    {day.toLocaleDateString([], { weekday: "long" })}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const end = new Date(day);
                  end.setHours(23, 59, 59, 999);
                  const past = end < now;
                  return (
                    <div
                      key={day.toISOString()}
                      className={`group relative min-h-28 border-r border-b p-2 ${day.getMonth() !== anchor.getMonth() ? "bg-muted/25 text-muted-foreground" : ""}`}
                    >
                      <button
                        className={`flex size-7 items-center justify-center rounded-full text-xs focus-visible:ring-2 focus-visible:ring-ring ${sameDay(day, now) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        onClick={() => setSelected(day)}
                        aria-label={`Show posts for ${day.toLocaleDateString()}`}
                      >
                        {day.getDate()}
                      </button>
                      {!past && (
                        <button
                          className="absolute top-3 right-3 rounded-full border p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-60"
                          aria-label={`Create post for ${day.toLocaleDateString()}`}
                          onClick={() => {
                            setSelected(day);
                            openDay(day);
                          }}
                        >
                          <Icon name="plus" size={12} />
                        </button>
                      )}
                      {dayPosts(day)
                        .slice(0, 2)
                        .map((post) => (
                          <div
                            key={post.id}
                            className="mt-1 flex items-center gap-1 rounded border bg-background px-1 py-1 text-[10px]"
                          >
                            <Icon name={post.provider} size={12} />
                            <span className="truncate">
                              {post.text || "Media post"}
                            </span>
                          </div>
                        ))}
                      {dayPosts(day).length > 2 && (
                        <p className="mt-1 text-[10px]">
                          +{dayPosts(day).length - 2} more
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-medium">
            {selected.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          {dayPosts(selected).length ? (
            <PostList posts={dayPosts(selected)} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Nothing planned for this day yet.
            </p>
          )}
        </section>
      </TabsContent>
    </Tabs>
  );
}

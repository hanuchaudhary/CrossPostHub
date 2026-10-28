import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/query";
import { Icon } from "@/components/ui/icon";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageHeading,
  PostList,
  QueryState,
} from "@/components/workspace/common";
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export default function SchedulePage() {
  const [today] = useState(() => new Date()),
    [month, setMonth] = useState(
      () => new Date(today.getFullYear(), today.getMonth(), 1),
    ),
    [selected, setSelected] = useState<Date>(today);
  const posts = useQuery(queries.posts());
  const scheduled = (posts.data ?? []).filter(
      (p) => p.isScheduled && p.scheduledFor,
    ),
    selectedPosts = scheduled.filter(
      (p) => dateKey(new Date(p.scheduledFor!)) === dateKey(selected),
    );
  return (
    <>
      <PageHeading
        title="Good things on the calendar."
        description="A bird’s-eye view of your creative rhythm."
      >
        <Button
          nativeButton={false}
          render={<Link to={`/create?date=${dateKey(selected)}`} />}
        >
          <Icon name="plus" />
          Schedule a post
        </Button>
      </PageHeading>
      <QueryState
        pending={posts.isPending}
        error={posts.error}
        retry={() => posts.refetch()}
      />
      {posts.isSuccess && (
        <div className="space-y-6">
          <section className="flex min-w-0 flex-col gap-4">
            <header className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Publishing calendar</h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Select a day to see what’s coming up.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const now = new Date();
                    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelected(now);
                  }}
                >
                  Today
                </Button>
              </div>
            </header>
            <div className="min-w-0">
              <Calendar
                mode="single"
                required
                selected={selected}
                onSelect={setSelected}
                month={month}
                onMonthChange={setMonth}
                weekStartsOn={1}
                fixedWeeks
                className="w-full p-0 [--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)]"
                classNames={{
                  root: "w-full",
                  months: "relative w-full",
                  month: "flex w-full flex-col gap-4",
                  week: "mt-0 flex w-full",
                  weekdays: "mb-2 flex",
                  day: "group/day relative h-20 w-full border border-border/50 p-0 text-center select-none sm:h-28",
                  outside: "text-muted-foreground opacity-40",
                }}
                components={{
                  DayButton: (props) => {
                    const dayPosts = scheduled.filter(
                      (post) =>
                        dateKey(new Date(post.scheduledFor!)) ===
                        dateKey(props.day.date),
                    );
                    return (
                      <CalendarDayButton
                        {...props}
                        className="h-full min-h-20 items-start justify-start rounded-none px-1.5 py-2 sm:min-h-28 sm:px-3"
                        aria-label={`${props.day.date.toLocaleDateString()}: ${dayPosts.length} posts`}
                      >
                        <span className="text-xs">
                          {props.day.date.getDate()}
                        </span>
                        <span className="mt-1 flex max-w-full flex-col gap-1">
                          {dayPosts.slice(0, 2).map((post) => (
                            <span
                              key={post.id}
                              className="flex min-w-0 items-center gap-1 rounded bg-muted p-1 text-[8px] text-foreground"
                            >
                              <Icon name={post.provider} size={12} />
                              <span className="hidden max-w-20 truncate lg:block">
                                {post.text || "Media post"}
                              </span>
                            </span>
                          ))}
                          {dayPosts.length > 2 && (
                            <span className="text-[8px]">
                              +{dayPosts.length - 2} more
                            </span>
                          )}
                        </span>
                      </CalendarDayButton>
                    );
                  },
                }}
              />
            </div>
          </section>
          <section className="flex min-w-0 flex-col gap-4">
            <header className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">
                {selected.toLocaleDateString([], {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {selectedPosts.length
                  ? "A little something to look forward to."
                  : "An open day. Endless possibilities."}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {selectedPosts.length} planned
                </Badge>
              </div>
            </header>
            <div className="min-w-0">
              {selectedPosts.length ? (
                <PostList posts={selectedPosts} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nothing planned for this day yet. Your next idea could go
                  here.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

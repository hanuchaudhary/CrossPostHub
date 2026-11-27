import type { ReactNode } from "react";
import { Link } from "react-router";

import { useQuery } from "@tanstack/react-query";

import { cn } from "cn";

import { CreatePostButton } from "@/components/posts/composer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PostList, QueryState } from "@/components/workspace/common";
import { authClient } from "@/lib/auth-client";
import { CHANNELS } from "@/lib/constants";
import { queries } from "@/lib/query";

import { PageLayout } from "../page-layout";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const posts = useQuery(queries.posts());
  const accounts = useQuery(queries.accounts());
  const rows = posts.data ?? [];
  const recent = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const upcoming = rows
    .filter((post) => post.isScheduled && post.status === "PENDING")
    .sort(
      (a, b) =>
        new Date(a.scheduledFor || a.createdAt).getTime() -
        new Date(b.scheduledFor || b.createdAt).getTime()
    );
  const channels = CHANNELS.filter((channel) => !channel.locked);
  const connected = new Set(
    accounts.data?.map((account) => account.providerId)
  );
  const stats = [
    {
      name: "Posts published",
      value: posts.isSuccess
        ? rows.filter((post) => post.status === "SUCCESS").length
        : "—",
      icon: "send" as const,
      note: "Ideas out in the world",
      to: "/posts",
    },
    {
      name: "Scheduled posts",
      value: posts.isSuccess ? upcoming.length : "—",
      icon: "calendar" as const,
      note: "A little momentum for tomorrow",
      to: "/schedule",
    },
    {
      name: "Connected channels",
      value: accounts.isSuccess
        ? channels.filter((channel) => connected.has(channel.id)).length
        : "—",
      icon: "link" as const,
      note: "More places for your ideas",
      to: "/connections",
    },
  ];

  return (
    <PageLayout
      title={`A little overview, ${session?.user.name.trim().split(/\s+/)[0] || "creator"}.`}
      description="Your ideas in motion. Your whole workspace, at a glance."
      actions={<CreatePostButton />}
    >
      <div className="space-y-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <Link
              key={stat.name}
              to={stat.to}
              className={cn(
                "group rounded-2xl bg-secondary/50 p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                index === stats.length - 1 && "col-span-2 sm:col-span-1"
              )}
            >
              <div className="rounded-xl bg-white p-4 ring-1 ring-secondary transition-colors group-hover:bg-white/70 dark:bg-background/60 dark:group-hover:bg-background/80">
                <p className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Icon name={stat.icon} size={16} />
                    {stat.name}
                  </span>
                  <Icon
                    name="arrow"
                    size={14}
                    className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </p>
                <p className="mt-3 text-3xl font-light tabular-nums">
                  {stat.value}
                </p>
              </div>
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {stat.note}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Panel
            id="recent-heading"
            title="Recent posts"
            description="The latest things you’ve put into motion."
            action={<ViewAll to="/posts">All posts</ViewAll>}
          >
            <QueryState
              loadingLabel="Loading recent posts"
              pending={posts.isPending}
              error={posts.error}
              retry={() => posts.refetch()}
            />
            {posts.isSuccess && <PostList posts={recent} compact />}
          </Panel>

          <Panel
            id="schedule-heading"
            title="Up next"
            description="A plan today. More space to create tomorrow."
            action={<ViewAll to="/schedule">Calendar</ViewAll>}
          >
            {!posts.isSuccess && (
              <QueryState
                loadingLabel="Loading your schedule"
                pending={posts.isPending}
                error={posts.error}
                retry={() => posts.refetch()}
              />
            )}
            {posts.isSuccess &&
              (upcoming.length ? (
                <PostList posts={upcoming.slice(0, 3)} />
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
                  <Icon
                    name="calendar"
                    size={28}
                    className="text-muted-foreground"
                  />
                  <p className="text-sm text-muted-foreground">
                    Your calendar has a little breathing room.
                  </p>
                  <Button
                    variant="secondary"
                    nativeButton={false}
                    render={<Link to="/schedule" />}
                  >
                    Open calendar
                  </Button>
                </div>
              ))}
          </Panel>
        </div>

        <section aria-labelledby="channels-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="channels-heading" className="text-lg font-medium">
                Channels
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your accounts connected and your ideas moving.
              </p>
            </div>
            <ViewAll to="/connections">Manage channels</ViewAll>
          </div>
          <QueryState
            loadingLabel="Loading your channels"
            pending={accounts.isPending}
            error={accounts.error}
            retry={() => accounts.refetch()}
          />
          {accounts.isSuccess && (
            <ul className="grid gap-4 sm:grid-cols-3">
              {channels.map((channel) => {
                const on = connected.has(channel.id);
                return (
                  <li key={channel.id}>
                    <Link
                      to="/connections"
                      className="group block rounded-2xl bg-popover p-1 ring-1 ring-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <div className="flex items-center gap-3 rounded-xl bg-secondary p-3 shadow ring-2 ring-muted transition-colors group-hover:bg-secondary/70">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-background">
                          <Icon name={channel.id} size={20} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{channel.name}</p>
                          <p
                            className={cn(
                              "mt-1 text-xs",
                              on
                                ? "text-lime-600 dark:text-lime-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {on ? "Connected" : "Ready to connect"}
                          </p>
                        </div>
                        <Icon
                          name={on ? "check" : "plus"}
                          size={16}
                          className="ml-auto shrink-0 text-muted-foreground"
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

function Panel({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="min-w-0 rounded-2xl bg-popover p-1 ring-1 ring-foreground/10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3 shadow ring-2 ring-muted">
        <div>
          <h2 id={id} className="text-sm font-medium">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-2">{children}</div>
    </section>
  );
}

function ViewAll({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <Icon
        name="arrow"
        size={16}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

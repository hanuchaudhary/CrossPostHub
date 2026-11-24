import { Link } from "react-router";

import { useQuery } from "@tanstack/react-query";

import { CreatePostButton } from "@/components/posts/composer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PageHeading,
  PostList,
  QueryState,
} from "@/components/workspace/common";
import { authClient } from "@/lib/auth-client";
import { CHANNELS } from "@/lib/constants";
import { queries } from "@/lib/query";

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
    <div className="space-y-10 py-6 md:space-y-12 md:py-0">
      <PageHeading
        title={`A little overview, ${session?.user.name.trim().split(/\s+/)[0] || "creator"}.`}
        description="Your ideas in motion. Your whole workspace, at a glance."
      >
        <CreatePostButton />
      </PageHeading>

      <dl className="grid divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="min-w-0 px-1 py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0"
          >
            <dt>
              <Link
                to={stat.to}
                className="flex items-center justify-between gap-3 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {stat.name}
                <Icon name={stat.icon} size={18} />
              </Link>
            </dt>
            <dd className="mt-4 text-4xl font-light tracking-tighter tabular-nums md:text-5xl">
              {stat.value}
            </dd>
            <dd className="mt-2 text-xs text-muted-foreground">{stat.note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:gap-8">
        <section aria-labelledby="recent-heading" className="min-w-0 space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <h2
                id="recent-heading"
                className="text-2xl font-light tracking-tight"
              >
                A little body of work.
              </h2>
              <p className="text-sm text-muted-foreground">
                The latest things you’ve put into motion.
              </p>
            </div>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link to="/posts" />}
            >
              All posts <Icon name="arrow" />
            </Button>
          </header>
          <div className="min-w-0 rounded-xl border py-2">
            <QueryState
              loadingLabel="Loading recent posts"
              pending={posts.isPending}
              error={posts.error}
              retry={() => posts.refetch()}
            />
            {posts.isSuccess && <PostList posts={recent} compact />}
          </div>
        </section>

        <section
          aria-labelledby="schedule-heading"
          className="min-w-0 rounded-2xl bg-muted/50 p-6 md:p-7"
        >
          <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="calendar" size={16} />
            UP NEXT
          </div>
          <h2
            id="schedule-heading"
            className="text-2xl font-light tracking-tight"
          >
            A little room to plan.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A plan today. More space to create tomorrow.
          </p>
          {posts.isSuccess &&
            (upcoming.length ? (
              <ul className="mt-6 divide-y">
                {upcoming.slice(0, 3).map((post) => (
                  <li
                    key={post.id}
                    className="flex min-w-0 items-center gap-3 py-4"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
                      <Icon name={post.provider} size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        {post.text || "A picture worth sharing"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(
                          post.scheduledFor || post.createdAt
                        ).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="my-6 rounded-xl border border-dashed p-5">
                <Icon
                  name="sparkle"
                  size={24}
                  className="mb-3 text-muted-foreground"
                />
                <p className="text-sm">
                  Your calendar has a little breathing room.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Give your next idea a date when you create a post.
                </p>
              </div>
            ))}
          {!posts.isSuccess && (
            <div className="my-6">
              <QueryState
                loadingLabel="Loading your schedule"
                pending={posts.isPending}
                error={posts.error}
                retry={() => posts.refetch()}
              />
            </div>
          )}
          <Button
            className="mt-4"
            variant="secondary"
            nativeButton={false}
            render={<Link to="/schedule" />}
          >
            Open calendar <Icon name="arrow" />
          </Button>
        </section>
      </div>

      <section aria-labelledby="channels-heading" className="border-t pt-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2
              id="channels-heading"
              className="text-2xl font-light tracking-tight"
            >
              One home. All your channels.
            </h2>
            <p className="text-sm text-muted-foreground">
              Keep your accounts connected and your ideas moving.
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/connections" />}
          >
            Manage channels <Icon name="external" />
          </Button>
        </header>
        <div className="mt-6">
          <QueryState
            loadingLabel="Loading your channels"
            pending={accounts.isPending}
            error={accounts.error}
            retry={() => accounts.refetch()}
          />
          {accounts.isSuccess && (
            <ul className="grid gap-3 sm:grid-cols-3">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <Link
                    to="/connections"
                    className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary">
                      <Icon name={channel.id} size={21} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{channel.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {connected.has(channel.id)
                          ? "Connected"
                          : "Ready to connect"}
                      </p>
                    </div>
                    <Icon
                      name={connected.has(channel.id) ? "check" : "plus"}
                      size={16}
                      className="ml-auto shrink-0 text-muted-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

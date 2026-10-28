import { CHANNELS } from "@/lib/constants";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { queries } from "@/lib/query";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageHeading,
  PostList,
  QueryState,
} from "@/components/workspace/common";

export default function DashboardPage() {
  const { data: session } = authClient.useSession(),
    posts = useQuery(queries.posts()),
    accounts = useQuery(queries.accounts());
  const rows = posts.data ?? [],
    published = rows.filter((p) => p.status === "SUCCESS").length,
    scheduled = rows.filter(
      (p) => p.isScheduled && p.status === "PENDING",
    ).length;
  return (
    <>
      <PageHeading
        title={`Hey ${session?.user.name.split(" ")[0] || "creator"}, let’s make waves.`}
        description="Your ideas, your people, your whole creative world. Right here."
      >
        <Button nativeButton={false} render={<Link to="/create" />}>
          <Icon name="plus" />
          Create a post
        </Button>
      </PageHeading>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            name: "Posts published",
            value: posts.isSuccess ? published : "—",
            icon: "send" as const,
            note: "Ideas out in the world",
          },
          {
            name: "On the calendar",
            value: posts.isSuccess ? scheduled : "—",
            icon: "calendar" as const,
            note: "Good things coming up",
          },
          {
            name: "Connected channels",
            value: accounts.isSuccess
              ? accounts.data.filter((a) =>
                  CHANNELS.some(
                    (channel) => !channel.locked && channel.id === a.providerId,
                  ),
                ).length
              : "—",
            icon: "link" as const,
            note: "More places to be you",
          },
        ].map((stat) => (
          <section className="flex min-w-0 flex-col gap-4" key={stat.name}>
            <header className="flex flex-col gap-2">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {stat.name}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Icon name={stat.icon} size={16} />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </h2>
            </header>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {stat.note}
            </div>
          </section>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.8fr_1fr]">
        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Your latest creations</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Every good story starts with a post.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link to="/posts" />}
              >
                View all <Icon name="arrow" />
              </Button>
            </div>
          </header>
          <div className="min-w-0">
            <QueryState
              pending={posts.isPending}
              error={posts.error}
              retry={() => posts.refetch()}
            />
            {posts.isSuccess && <PostList posts={rows} compact />}
          </div>
        </section>
        <section className="flex min-w-0 flex-col gap-4 bg-muted/40">
          <header className="flex flex-col gap-5">
            <Badge variant="outline">A LITTLE NUDGE</Badge>
            <Icon name="sparkle" size={45} className="text-muted-foreground" />
            <h2 className="font-medium text-2xl tracking-tight">
              Consistency looks
              <br />
              good on you.
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A little planning today means more time to create tomorrow. Give
              your next idea a date.
            </p>
          </header>
          <div className="flex items-center gap-2">
            <Button nativeButton={false} render={<Link to="/schedule" />}>
              Meet your calendar <Icon name="arrow" />
            </Button>
          </div>
        </section>
      </div>
      <section className="flex min-w-0 flex-col gap-4 mt-6">
        <header className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">
            One home for all your channels.
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Connect an account and let your ideas travel further.
          </p>
          <div className="flex-wrap items-center hidden gap-3 sm:flex">
            <Icon name="twitter" size={24} />
            <Icon name="linkedin" size={24} />
            <Icon name="instagram" size={24} />
          </div>
        </header>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/connections" />}
          >
            Manage connections <Icon name="external" />
          </Button>
        </div>
      </section>
    </>
  );
}

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { CreatePostButton } from "@/components/posts/composer";
import { FilterTabs } from "@/components/ui/filter-tabs";
import {
  PostList,
  postState,
  QueryState,
} from "@/components/workspace/common";
import { queries } from "@/lib/query";
import type { Post } from "@/lib/types";

import { PageLayout } from "../page-layout";

type Filter = "ALL" | "UPCOMING" | "POSTED" | "FAILED";

const FILTERS: Record<
  Filter,
  { label: string; match: (post: Post) => boolean; empty: string }
> = {
  ALL: {
    label: "All",
    match: () => true,
    empty: "Create your first post and start a little momentum.",
  },
  UPCOMING: {
    label: "Upcoming",
    match: (post) => ["scheduled", "posting"].includes(postState(post)),
    empty: "Nothing scheduled. Give your next idea a date.",
  },
  POSTED: {
    label: "Posted",
    match: (post) => postState(post) === "posted",
    empty: "Nothing posted yet.",
  },
  FAILED: {
    label: "Failed",
    match: (post) => postState(post) === "failed",
    empty: "No failed posts. Nice.",
  },
};

const timeOf = (post: Post) =>
  new Date(post.scheduledFor || post.createdAt).getTime();

export default function PostsPage() {
  const posts = useQuery(queries.posts());
  const [filter, setFilter] = useState<Filter>("ALL");
  const all = posts.data ?? [];
  const shown = all
    .filter(FILTERS[filter].match)
    .sort((a, b) =>
      filter === "UPCOMING" ? timeOf(a) - timeOf(b) : timeOf(b) - timeOf(a)
    );

  return (
    <PageLayout
      title="A little body of work."
      description="Everything you’ve published, planned, and put into motion."
      actions={<CreatePostButton />}
    >
      <div className="space-y-4">
        <FilterTabs
          label="Filter posts"
          value={filter}
          onChange={setFilter}
          options={(Object.keys(FILTERS) as Filter[]).map((key) => ({
            key,
            label: FILTERS[key].label,
            count: posts.isSuccess
              ? all.filter(FILTERS[key].match).length
              : undefined,
          }))}
        />
        <QueryState
          loadingLabel="Loading your posts"
          pending={posts.isPending}
          error={posts.error}
          retry={() => posts.refetch()}
        />
        {posts.isSuccess && (
          <PostList posts={shown} empty={FILTERS[filter].empty} />
        )}
      </div>
    </PageLayout>
  );
}

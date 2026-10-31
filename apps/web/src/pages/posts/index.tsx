import { useQuery } from "@tanstack/react-query";

import { CreatePostButton } from "@/components/posts/composer";
import {
  PageHeading,
  PostList,
  QueryState,
} from "@/components/workspace/common";
import { queries } from "@/lib/query";

export default function PostsPage() {
  const posts = useQuery(queries.posts());
  return (
    <>
      <PageHeading
        title="A little body of work."
        description="Everything you’ve published, planned, and put into motion."
      >
        <CreatePostButton />
      </PageHeading>
      <QueryState
        pending={posts.isPending}
        error={posts.error}
        retry={() => posts.refetch()}
      />
      {posts.isSuccess && (
        <section className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            <PostList posts={posts.data} />
          </div>
        </section>
      )}
    </>
  );
}

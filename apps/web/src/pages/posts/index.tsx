import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/query";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  PageHeading,
  PostList,
  QueryState,
} from "@/components/workspace/common";

export default function PostsPage() {
  const posts = useQuery(queries.posts());
  return (
    <>
      <PageHeading
        title="A little body of work."
        description="Everything you’ve published, planned, and put into motion."
      >
        <Button nativeButton={false} render={<Link to="/create" />}>
          <Icon name="plus" />
          Create a post
        </Button>
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

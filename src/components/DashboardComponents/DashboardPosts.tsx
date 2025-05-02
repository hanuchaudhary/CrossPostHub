"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStore";
import type { Post } from "@/Types/Types";
import Image from "next/image";
import { Button } from "../ui/button";

interface PostsResponse {
  ScheduledPosts: Post[];
  FailedPosts: Post[];
  SuccessPosts: Post[];
}

export default function DashboardPosts() {
  const { fetchPosts, userPosts } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("published");
  const [limit, setLimit] = useState("10");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchPosts({
      limit: Number.parseInt(limit),
      offset,
    }).finally(() => setLoading(false));
  }, [limit, offset, fetchPosts]);

  const getPostCount = (category: keyof PostsResponse) => {
    return userPosts ? userPosts[category].length : 0;
  };

  const handleNextPage = () => {
    setOffset((prev) => prev + Number.parseInt(limit));
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - Number.parseInt(limit)));
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs
        defaultValue="published"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-2 h-12 font-ClashDisplayMedium rounded-xl">
          <TabsTrigger value="published" className="relative h-10 rounded-xl">
            Published
            {activeTab === "published" && getPostCount("SuccessPosts") > 0 && (
              <Badge className="ml-2 bg-secondary" variant={"outline"}>
                {getPostCount("SuccessPosts")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="relative h-10 rounded-xl">
            Scheduled
            {activeTab === "scheduled" &&
              getPostCount("ScheduledPosts") > 0 && (
                <Badge className="ml-2 bg-secondary" variant={"outline"}>
                  {getPostCount("ScheduledPosts")}
                </Badge>
              )}
          </TabsTrigger>
          <TabsTrigger value="failed" className="relative h-10 rounded-xl">
            Failed
            {activeTab === "failed" && getPostCount("FailedPosts") > 0 && (
              <Badge className="ml-2 bg-secondary" variant={"outline"}>
                {getPostCount("FailedPosts")}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
          </div>
        ) : (
          <>
            <TabsContent value="published" className="mt-0">
              <div className="bg-secondary p-1 rounded-xl h-[70vh] overflow-y-scroll">
                {userPosts?.SuccessPosts.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[50vh] ">
                    <p className="text-center py-2 px-6 text-muted-foreground font-ClashDisplayMedium bg-primary-foreground rounded-2xl border-2">
                      No published posts.
                    </p>
                  </div>
                ) : (
                  userPosts?.SuccessPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
                {userPosts?.SuccessPosts.length > 0 && (
                  <div className="flex justify-end font-ClashDisplayMedium gap-2 mt-4">
                    <Button
                      onClick={handlePrevPage}
                      disabled={offset === 0}
                      className={`${
                        offset === 0 ? "cursor-not-allowed" : "cursor-pointer"
                      } bg-primary px-4 py-2 rounded-md`}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={
                        userPosts?.SuccessPosts.length < Number.parseInt(limit)
                      }
                      className={`${
                        userPosts?.SuccessPosts.length < Number.parseInt(limit)
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      } bg-primary px-4 py-2 rounded-md`}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="scheduled" className="mt-0">
              <div className="bg-secondary p-1 rounded-xl h-[70vh] overflow-y-scroll">
                {userPosts?.ScheduledPosts.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[50vh] ">
                    <p className="text-center py-2 px-6 text-muted-foreground font-ClashDisplayMedium bg-primary-foreground rounded-2xl border-2">
                      No scheduled posts.
                    </p>
                  </div>
                ) : (
                  userPosts?.ScheduledPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
                {userPosts?.ScheduledPosts.length > 0 && (
                  <div className="flex justify-end font-ClashDisplayMedium gap-2 mt-4">
                    <Button
                      onClick={handlePrevPage}
                      disabled={offset === 0}
                      className={`${
                        offset === 0 ? "cursor-not-allowed" : "cursor-pointer"
                      } bg-primary px-4 py-2 rounded-md`}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={
                        userPosts?.ScheduledPosts.length <
                        Number.parseInt(limit)
                      }
                      className={`${
                        userPosts?.ScheduledPosts.length <
                        Number.parseInt(limit)
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      } bg-primary px-4 py-2 rounded-md`}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="failed" className="mt-0">
              <div className="bg-secondary p-1 rounded-xl min-h-[70vh] overflow-y-scroll">
                {userPosts?.FailedPosts.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[50vh] ">
                    <p className="text-center py-2 px-6 text-muted-foreground font-ClashDisplayMedium bg-primary-foreground rounded-2xl border-2">
                      No failed posts.
                    </p>
                  </div>
                ) : (
                  userPosts?.FailedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
                {userPosts?.FailedPosts.length > 0 && (
                  <div className="flex justify-end font-ClashDisplayMedium gap-2 mt-4">
                    <Button
                      onClick={handlePrevPage}
                      disabled={offset === 0}
                      className={`${
                        offset === 0 ? "cursor-not-allowed" : "cursor-pointer"
                      } bg-primary px-4 py-2 rounded-md`}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={
                        userPosts?.FailedPosts.length < Number.parseInt(limit)
                      }
                      className={`${
                        userPosts?.FailedPosts.length < Number.parseInt(limit)
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      } bg-primary px-4 py-2 rounded-md`}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

const PostCard = ({ post }: { post: Post }) => {
  const { id, text, provider, createdAt } = post;
  return (
    <div
      key={id}
      className="mb-4 w-full rounded-xl border p-3 bg-primary-foreground shadow-sm"
    >
      <div className="flex justify-between">
        <div>
          <div className="inline-block text-xs bg-secondary px-2 py-1 rounded-md font-ClashDisplayMedium tracking-wider text-muted-foreground">
            {new Date(createdAt!).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
          <p className="mt-4 text-muted-foreground w-[30rem]">
            <span className="font-ClashDisplayMedium text-primary">
              Caption:
            </span>{" "}
            {text}
          </p>
        </div>
        <div>
          {provider && (
            <Image
              src={`/${provider}.svg`}
              alt={provider}
              width={60}
              height={60}
              className={`inline-block ${provider === "twitter" ? "dark:invert-[1]" : ""}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

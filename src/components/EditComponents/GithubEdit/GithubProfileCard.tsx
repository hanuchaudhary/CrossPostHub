"use client";

import Image from "next/image";
import GitHubCalendar from "react-github-calendar";
import { useGithubEditStore } from "@/store/MainStore/useGithubEditStore";
import { customToast } from "@/components/CreatePost/customToast";
import React from "react";

export default function GithubProfileCard() {
  const store = useGithubEditStore();
  const user = store.githubUser;
  const loading = store.isLoading;
  const [noData, setNoData] = React.useState(false);

  if (loading) {
    return (
      <div
        style={{
          borderRadius: store.border.radius,
          borderColor: store.border.color,
          borderWidth: store.border.width,
          borderStyle: store.border.type,
        }}
        className="border-double bg-black/90 backdrop-blur-xl p-6 animate-pulse"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="rounded-full w-24 h-24 bg-gray-700"></div>
            <div className="space-y-3">
              <div className="h-6 w-36 bg-gray-700 rounded"></div>
              <div className="h-4 w-56 bg-gray-700 rounded"></div>
              <div className="h-4 w-48 bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="w-16 h-16 rounded bg-gray-700"></div>
        </div>
        <div className="mt-6">
          <div className="h-28 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const handleTransformData = React.useCallback(
    (data: any[]) => {
      if (!data || data.length === 0) {
        if (!noData) {
          setNoData(true);
          customToast({
            title: "No Data Found",
            description: `No contribution data found for year: ${store.graphTweeks.year}`,
            badgeVariant: "destructive",
          });
        }
        return [];
      } else {
        if (noData) setNoData(false);
        return data;
      }
    },
    [store.graphTweeks.year, noData]
  );

  return (
    <div
      style={{
        borderRadius: store.border.radius,
        borderColor: store.border.color,
        borderWidth: store.border.width,
        borderStyle: store.border.type,
      }}
      className="border-double bg-black/90 backdrop-blur-xl p-6 "
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="rounded-full w-24 h-24">
            <Image
              src={user.avatar_url}
              alt="profile"
              width={50}
              height={50}
              className="object-cover rounded-full border-2 border-double h-full w-full"
            />
          </div>
          <div>
            <h2 className="md:text-2xl text-xl font-bold text-white">
              {user.name}
            </h2>
            <div className="flex items-center gap-2">
              <p className="">@{user.login}</p>•{" "}
              <span>
                {user.followers}{" "}
                <span className="text-muted-foreground">Followers</span>
              </span>{" "}
              •{" "}
              <span>
                {user.following}{" "}
                <span className="text-muted-foreground">Following</span>
              </span>
            </div>
            <p className="text-neutral-400 mt-1">{user.bio}</p>
          </div>
        </div>

        <div className="text-neutral-400 flex flex-col items-end">
          <Image src={"/github.svg"} alt="github" width={60} height={60} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-6">
        {noData ? (
          <div className="w-full text-center text-neutral-400 py-8">
            No contribution data found for{" "}
            {store.graphTweeks.year === "last" ? "last year" : store.graphTweeks.year}.
          </div>
        ) : (
          <GitHubCalendar
            year={store.graphTweeks.year || "last"}
            blockMargin={store.graphTweeks.blockMargin}
            blockSize={store.graphTweeks.blockSize}
            blockRadius={store.graphTweeks.blockRadius}
            theme={{
              dark: store.theme,
            }}
            username={store.githubUser.login}
            fontSize={12}
            errorMessage="Error loading calendar"
            style={{
              width: "100%",
              height: "auto",
            }}
            labels={{
              totalCount: "{{count}} contributions in the last year",
            }}
            transformData={handleTransformData}
          />
        )}
      </div>
    </div>
  );
}

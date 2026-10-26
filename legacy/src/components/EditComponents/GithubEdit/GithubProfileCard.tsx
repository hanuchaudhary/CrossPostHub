"use client";

import Image from "next/image";
import GitHubCalendar from "react-github-calendar";
import { useGithubEditStore } from "@/store/MainStore/useGithubEditStore";
import { customToast } from "@/components/CreatePost/customToast";
import React, { useEffect } from "react";
import { getImageFromUrl } from "../EditTools";

export default function GithubProfileCard() {
  const store = useGithubEditStore();
  const user = store.githubUser;
  const loading = store.isLoading;
  const [noData, setNoData] = React.useState(false);

  useEffect(() => {
    setNoData(false);
  }, [store.graphTweaks.year]);

  const handleTransformData = (data: any[]) => {
    if (!data || data.length === 0) {
      setNoData(true);
      customToast({
        title: "No Data Found",
        description: `No contribution data found for year: ${store.graphTweaks.year || "selected year"}`,
        badgeVariant: "destructive",
      });
      return [];
    }
    setNoData(false);
    return data;
  };

  const [imageUrl, setImageUrl] = React.useState<string>("/default-avatar.png");

  useEffect(() => {
    if (!loading) {
      getImageFromUrl(user.avatar_url).then((url) => {
        if (url) {
          setImageUrl(url);
        }
      });
    }
  }, [user.avatar_url, loading]);

  if (loading) {
    return (
      <div
        style={{
          borderRadius: store.border.radius,
          borderColor: store.border.color,
          borderWidth: store.border.width,
          borderStyle: store.border.type,
        }}
        className="border-double bg-black/90 p-6 animate-pulse" // Removed backdrop-blur-xl
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

  return (
    <div
      style={{
        borderRadius: store.border.radius,
        borderColor: store.border.color,
        borderWidth: store.border.width,
        borderStyle: store.border.type,
        position: "relative",
      }}
      className="border-double p-6 overflow-hidden"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${store.background.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: `blur(${store.cardBlur.blur}px) brightness(${store.cardBlur.brightness})`,
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: -1,
        }}
      />
      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="rounded-full w-24 h-24">
              <Image
                src={imageUrl || "/default-avatar.png"}
                alt="profile"
                width={96} // Match container size
                height={96}
                className="object-cover rounded-full border-2 border-double h-full w-full"
              />
            </div>
            <div>
              <h2 className="md:text-2xl text-xl font-bold text-white">
                {user.name || "Unknown User"}
              </h2>
              <div className="flex items-center gap-2">
                <p className="">@{user.login || "unknown"}</p>
                <span className="text-neutral-400">•</span>
                <span>
                  {user.followers || 0}{" "}
                  <span className="text-muted-foreground">Followers</span>
                </span>
                <span className="text-neutral-400">•</span>
                <span>
                  {user.following || 0}{" "}
                  <span className="text-muted-foreground">Following</span>
                </span>
              </div>
              <p className="text-neutral-400 mt-1">
                {user.bio || "No bio available"}
              </p>
            </div>
          </div>

          <div className="text-neutral-400 flex flex-col items-end">
            <Image src={"/github.svg"} alt="github" width={60} height={60} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-6">
          {noData ? (
            <div className="text-neutral-400 text-center w-full">
              No contributions found for{" "}
              {store.graphTweaks.year || "the selected year"}.
            </div>
          ) : (
            <GitHubCalendar
              year={store.graphTweaks.year || "last"}
              blockMargin={store.graphTweaks.blockMargin}
              blockSize={store.graphTweaks.blockSize}
              blockRadius={store.graphTweaks.blockRadius}
              theme={{
                dark: store.theme,
              }}
              username={store.githubUser.login || ""}
              fontSize={12}
              errorMessage="Error loading calendar"
              style={{
                width: "100%",
                height: "auto",
              }}
              labels={{
                totalCount: noData
                  ? "No contributions this year"
                  : "{{count}} contributions in the last year",
              }}
              transformData={handleTransformData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

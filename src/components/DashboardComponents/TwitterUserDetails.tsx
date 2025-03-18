import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { DashboardDataType } from "@/store/DashboardStore/useDashboardStore";

export default function TwitterUserDetails({
  dashboardData,
}: {
  dashboardData: DashboardDataType;
}) {
  return (
    <div className="bg-white dark:bg-secondary/30 border dark:border-secondary border-neutral-200 shadow-sm rounded-2xl p-4">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={dashboardData?.twitterUserDetails.profile_image_url_https}
          />
          <AvatarFallback>
            {dashboardData?.twitterUserDetails.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-ClashDisplayRegular text-xl leading-none mb-1">
            {dashboardData?.twitterUserDetails.name}
          </h3>
          <p className="text-muted-foreground">
            @{dashboardData?.twitterUserDetails.screen_name}
          </p>
        </div>
        <Image
          className="dark:invert-[1]"
          src={"/twitter.svg"}
          height={70}
          width={70}
          alt="linkedin"
        />
      </div>
      <div className="flex justify-between text-sm">
        <div>
          <p className="font-medium">
            {dashboardData?.twitterUserDetails.followers_count}
          </p>
          <p className="text-muted-foreground">Followers</p>
        </div>
        <div>
          <p className="font-medium">
            {dashboardData?.twitterUserDetails.friends_count}
          </p>
          <p className="text-muted-foreground">Following</p>
        </div>
      </div>
    </div>
  );
}

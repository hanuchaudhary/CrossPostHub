import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import type { DashboardDataType } from "@/store/DashboardStore/useDashboardStore";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Link, MapPin, VerifiedIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import React from "react";

export default function TwitterUserDetails({
  dashboardData,
}: {
  dashboardData: DashboardDataType;
}) {
  // Format the creation date
  const createdDate = dashboardData?.twitterUserDetails.createdAt
    ? new Date(dashboardData.twitterUserDetails.createdAt)
    : null;

  const accountAge = createdDate
    ? formatDistanceToNow(createdDate, { addSuffix: true })
    : null;

  return (
    <div className="bg-white dark:bg-secondary/30 border dark:border-secondary border-neutral-200 shadow-sm rounded-2xl p-4">
      {/* Banner image if available */}
      {dashboardData?.twitterUserDetails.profile_banner_url && (
        <div className="h-32 -mx-4 -mt-4 mb-4 relative overflow-hidden rounded-t-2xl">
          <Image
            src={
              dashboardData.twitterUserDetails.profile_banner_url ||
              "/placeholder.svg"
            }
            alt="Profile banner"
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-center space-x-2 mb-2">
        <Avatar className="h-14 w-14 border-2 border-background">
          <AvatarImage
            src={
              dashboardData?.twitterUserDetails.profile_image_url_https ||
              "/placeholder.svg"
            }
          />
          <AvatarFallback>
            {dashboardData?.twitterUserDetails.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h3 className="text-xl leading-none">
              {dashboardData?.twitterUserDetails.name}
            </h3>
            {dashboardData?.twitterUserDetails.verified && (
              <VerifiedIcon className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <p className="text-muted-foreground">
            @{dashboardData?.twitterUserDetails.screen_name}
          </p>
        </div>
        <Image
          className="dark:invert-[1]"
          src={"/twitter.svg"}
          height={50}
          width={50}
          alt="Twitter"
        />
      </div>

      {dashboardData?.twitterUserDetails.description && (
        <p className="text-sm mb-4">
          {dashboardData.twitterUserDetails.description
            .split(/https?:\/\/\S+/)
            .map((text, index, array) => (
              <React.Fragment key={index}>
                {text}
                {index < array.length - 1 &&
                  dashboardData.twitterUserDetails.description.match(
                    /https?:\/\/\S+/g
                  )?.[index] && (
                    <a
                      href={
                        dashboardData.twitterUserDetails.description.match(
                          /https?:\/\/\S+/g
                        )?.[index] || "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {dashboardData.twitterUserDetails.description
                        .match(/https?:\/\/\S+/g)
                        ?.[index].replace(/https?:\/\/(www\.)?|\/$/g, "")}
                    </a>
                  )}
              </React.Fragment>
            ))}
        </p>
      )}

      {/* Additional profile details */}
      <div className="grid grid-cols-1 gap-1 mb-4 text-sm">
        {dashboardData?.twitterUserDetails.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{dashboardData.twitterUserDetails.location}</span>
          </div>
        )}

        {dashboardData?.twitterUserDetails.url && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link className="h-4 w-4" />
            <a
              href={dashboardData.twitterUserDetails.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {dashboardData.twitterUserDetails.url.replace(
                /^https?:\/\/(www\.)?/,
                ""
              )}
            </a>
          </div>
        )}

        {createdDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              Joined {createdDate.toLocaleDateString()} ({accountAge})
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4 dark:border-secondary border-neutral-200">
        <div>
          <span className="font-medium text-base">
            {dashboardData?.twitterUserDetails.followers_count.toLocaleString()}{" "}
            <span className="text-muted-foreground">Followers</span>
          </span>
        </div>
        <div>
          <span className="font-medium text-base">
            {dashboardData?.twitterUserDetails.friends_count.toLocaleString()}{" "}
            <span className="text-muted-foreground">Following</span>
          </span>
        </div>
      </div>
    </div>
  );
}

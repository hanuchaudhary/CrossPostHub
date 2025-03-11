"use client";

import * as React from "react";
import { X, Twitter, Linkedin, LogOut, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStoreStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "./UserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, Tooltip } from "recharts";
import { ScrollArea } from "../ui/scroll-area";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlowingButton } from "../Buttons/GlowingButton";
import Image from "next/image";

export function Profile() {
  const { fetchAccountDetails, twitterUserDetails, fetchDashboardData,dashboardData } =
    useDashboardStore();
  // React.useEffect(() => {
  //   fetchAccountDetails();
  // }, [fetchAccountDetails]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const router = useRouter();

  // Dummy LinkedIn profile data
  const linkedInProfile = {
    name: "Kush Cjaudhary",
    headline: "Software Engineer at Tech Co.",
    profileImageUrl: "https://randomuser.me/api/portraits",
    connections: 500,
  };

  // Dummy graph data for posts on different platforms
  // const postData = [
  //   { month: "Jan", Twitter: 15, LinkedIn: 8, Instagram: 20 },
  //   { month: "Feb", Twitter: 20, LinkedIn: 10, Instagram: 25 },
  //   { month: "Mar", Twitter: 18, LinkedIn: 12, Instagram: 22 },
  //   { month: "Apr", Twitter: 25, LinkedIn: 15, Instagram: 30 },
  //   { month: "May", Twitter: 22, LinkedIn: 18, Instagram: 28 },
  //   { month: "Jun", Twitter: 30, LinkedIn: 20, Instagram: 35 },
  //   { month: "Jul", Twitter: 28, LinkedIn: 22, Instagram: 32 },
  //   { month: "Aug", Twitter: 35, LinkedIn: 25, Instagram: 40 },
  //   { month: "Sep", Twitter: 32, LinkedIn: 28, Instagram: 38 },
  //   { month: "Oct", Twitter: 40, LinkedIn: 30, Instagram: 45 },
  //   { month: "Nov", Twitter: 38, LinkedIn: 32, Instagram: 42 },
  //   { month: "Dec", Twitter: 45, LinkedIn: 35, Instagram: 50 },
  // ];

  return (
    <Drawer>
      <DrawerTrigger>
        <UserProfile />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-ClashDisplayRegular text-2xl mb-2">
            Profile
          </DrawerTitle>
          <DrawerDescription>
            Your connected platforms and their details.
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="p-4">
          <div className="space-y-4">
            {twitterUserDetails && (
              <div className="bg-secondary/30 rounded-2xl p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={twitterUserDetails.profile_image_url_https}
                    />
                    <AvatarFallback>
                      {twitterUserDetails.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-ClashDisplayRegular text-xl leading-none mb-1">
                      {twitterUserDetails.name}
                    </h3>
                    <p className="text-muted-foreground">
                      @{twitterUserDetails.screen_name}
                    </p>
                  </div>
                  <Image
                    className="invert-[1]"
                    src={"/twitter.svg"}
                    height={70}
                    width={70}
                    alt="linkedin"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">
                      {twitterUserDetails.followers_count}
                    </p>
                    <p className="text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {twitterUserDetails.friends_count}
                    </p>
                    <p className="text-muted-foreground">Following</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-secondary/30 border rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={linkedInProfile.profileImageUrl} />
                  <AvatarFallback>{linkedInProfile.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg leading-none">
                    {linkedInProfile.name}
                  </h3>
                  <p className="text-muted-foreground leading-none text-sm">
                    {linkedInProfile.headline}
                  </p>
                </div>
                <Image
                  src={"/linkedin.svg"}
                  height={70}
                  width={70}
                  alt="linkedin"
                />
              </div>
              <div className="flex gap-1 text-sm">
                <p className="font-medium">{linkedInProfile.connections}</p>
                <p className="text-muted-foreground">Connections</p>
              </div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle>Posts Across Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    Twitter: {
                      label: "Twitter",
                      color: "green",
                    },
                    LinkedIn: {
                      label: "LinkedIn",
                      color: "hsl(201, 100%, 35%)",
                    },
                    Instagram: {
                      label: "Instagram",
                      color: "hsl(340, 75%, 54%)",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={dashboardData}>
                    <XAxis dataKey="month" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="twitter" fill="#ffffff" />
                    <Bar dataKey="linkedin" fill="#0088D1" />
                    <Bar dataKey="instagram" fill="#EB5949" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle>Posting Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Your Twitter posts have increased by 50% since January.
                  </li>
                  <li>LinkedIn shows steady growth in posting frequency.</li>
                  <li>
                    Instagram remains your most active platform for posts.
                  </li>
                  <li>
                    Consider increasing your LinkedIn activity to match other
                    platforms.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        <div
          onClick={() => {
            signOut();
            router.push("/signin");
          }}
        >
          <GlowingButton
            color="red"
            className="absolute backdrop-blur-3xl bottom-4 right-4"
          >
            <span className="flex flex-row items-center space-x-1">
              <LogOut className="h-4 w-4" /> <span>Logout</span>
            </span>
          </GlowingButton>
        </div>
        <DrawerClose className="absolute top-2 right-2">
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

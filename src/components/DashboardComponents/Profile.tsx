"use client";

import * as React from "react";
import { X, LogOut } from "lucide-react";
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
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "./UserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, Tooltip } from "recharts";
import { ScrollArea } from "../ui/scroll-area";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TwitterUserDetails from "./TwitterUserDetails";
import LogoutButton from "../Buttons/LogoutButton";

export function Profile() {
  const { fetchDashboardData, dashboardData } = useDashboardStore();

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
  const postData = [
    { month: "Jan", twitter: 15, linkedin: 8, instagram: 20 },
    { month: "Feb", twitter: 20, linkedin: 10, instagram: 25 },
    { month: "Mar", twitter: 18, linkedin: 12, instagram: 22 },
    { month: "Apr", twitter: 25, linkedin: 15, instagram: 30 },
    { month: "May", twitter: 22, linkedin: 18, instagram: 28 },
    { month: "Jun", twitter: 30, linkedin: 20, instagram: 35 },
    { month: "Jul", twitter: 28, linkedin: 22, instagram: 32 },
    { month: "Aug", twitter: 35, linkedin: 25, instagram: 40 },
    { month: "Sep", twitter: 32, linkedin: 28, instagram: 38 },
    { month: "Oct", twitter: 40, linkedin: 30, instagram: 45 },
    { month: "Nov", twitter: 38, linkedin: 32, instagram: 42 },
    { month: "Dec", twitter: 45, linkedin: 35, instagram: 50 },
  ];

  return (
    <Drawer>
      <DrawerTrigger>
        <UserProfile />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-ClashDisplayRegular text-2xl mb-2 text-emerald-500">
            Profile
          </DrawerTitle>
          <DrawerDescription>
            Your connected platforms and their details.
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {dashboardData?.twitterUserDetails && (
                <TwitterUserDetails dashboardData={dashboardData} />
              )}

              <div className="bg-white dark:bg-secondary/30 border dark:border-secondary border-neutral-200 shadow-sm rounded-2xl p-4">
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
            </div>

            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle>Posts Across Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.monthlyData ? (
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
                    {/* <BarChart data={dashboardData.monthlyData}> */}
                    <BarChart data={postData}>
                      <XAxis dataKey="month" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="twitter" fill="hsl(203, 89%, 53%)" />
                      <Bar dataKey="linkedin" fill="hsl(201, 100%, 35%)" />
                      <Bar dataKey="instagram" fill="hsl(340, 75%, 54%)" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div>
                    <p className="text-center text-muted-foreground border-2 border-secondary rounded-lg p-4 font-ClashDisplayMedium">
                      Create posts on your connected platforms to see insights
                    </p>
                  </div>
                )}
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

        <div className="absolute backdrop-blur-3xl bottom-4 right-4">
          <LogoutButton />
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

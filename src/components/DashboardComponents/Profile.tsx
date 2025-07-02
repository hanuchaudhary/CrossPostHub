"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStore";
import { UserProfile } from "./UserProfile";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, Tooltip } from "recharts";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter } from "next/navigation";
import TwitterUserDetails from "./TwitterUserDetails";
import LogoutButton from "../Buttons/LogoutButton";
import LinkedinUserDetails from "./LinkedinUserDetails";
import DashboardPosts from "./DashboardPosts";

export function Profile() {
  const { fetchDashboardData, dashboardData } = useDashboardStore();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const router = useRouter();

  // Dummy LinkedIn profile data
  const linkedInProfile = {
    name: "Kush Chaudhary",
    headline: "Software Engineer at Tech Co.",
    profileImageUrl: "https://randomuser.me/api/portraits",
    connections: 500,
  };

  // MOCK DATA
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
        <div className="px-4 pt-3">
          <h2 className="font-ClashDisplayMedium text-2xl text-emerald-500">
            Profile Dashboard
          </h2>
          <p className="text-muted-foreground text-sm font-ClashDisplayRegular">
            Analytics overview for your connected platforms and posting
            activity.
          </p>
        </div>
        <ScrollArea className="p-4">
          <div className="space-y-4 my-8">
            <DashboardPosts />
            <div className="border-none shadow-none bg-transparent">
              <h2 className="font-ClashDisplayMedium py-4">
                Posts Across Platforms
              </h2>

              <div>
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
                    <BarChart data={dashboardData.monthlyData}>
                      {/* <BarChart data={postData}> */}
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
              </div>
            </div>

            <div className="">
              <p className="font-ClashDisplayMedium py-4">
                Connected Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                {dashboardData?.twitterUserDetails && (
                  <TwitterUserDetails dashboardData={dashboardData} />
                )}
                <LinkedinUserDetails />
              </div>
            </div>
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

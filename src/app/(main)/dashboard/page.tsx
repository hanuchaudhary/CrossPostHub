import { Analytics } from "@/components/DashboardComponents/Analytics";
import { ConnectedAccounts } from "@/components/DashboardComponents/ConnectedAccounts";
import { DashboardHeader } from "@/components/DashboardComponents/DashboardHeader";
import { QuickActions } from "@/components/DashboardComponents/QuickActions";
import { RecentPosts } from "@/components/DashboardComponents/RecentPosts";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CrossPost Hub",
  description: "CrossPost Hub's dashboard.",
};


export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHeader userName="John Doe" />
      <QuickActions />
      <RecentPosts />
      <ConnectedAccounts />
      <Analytics />
      {/* <h1 className="px-32 py-2 bg-secondary/30 border border-secondary/40 rounded-lg">This is Dashboard</h1> */}
    </div>
  );
}

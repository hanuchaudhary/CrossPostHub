import { ConnectAccounts } from "@/components/DashboardComponents/ConnectAccounts";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CrossPost Hub",
  description: "CrossPost Hub's dashboard.",
};

export default function Dashboard() {
  return (
    <div className="relative grid grid-cols-2 h-full max-w-7xl overflow-x-hidden mx-auto sm:px-6 lg:px-8 pb-6">
      <ConnectAccounts />
      <div className="border-l">

      </div>
    </div>
  );
}

import { ConnectAccounts } from "@/components/DashboardComponents/ConnectAccounts";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CrossPost Hub",
  description: "CrossPost Hub's dashboard.",
};

export default function Dashboard() {
  return (
    <div className="relative">
      <ConnectAccounts />
    </div>
  );
}

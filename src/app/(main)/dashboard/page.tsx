import { ConnectAccounts } from "@/components/DashboardComponents/ConnectAccounts";
import { SecurityDisclaimerDialog } from "@/components/DashboardComponents/SecurityDisclaimerDialog";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CrosspostHub",
  description: "Manage your accounts and settings on CrossPostHub.",
};

export default function Dashboard() {
  return (
    <div className="relative">
      <SecurityDisclaimerDialog />
      <ConnectAccounts />
    </div>
  );
}

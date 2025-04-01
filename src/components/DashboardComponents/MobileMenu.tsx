"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Home,
  LogOut,
  PlusCircle,
  HelpCircle,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "./UserProfile";
import UpgradeButton from "../Buttons/UpgradeButton";
import NotificationButton from "../Buttons/NotificationsButton";
import Guide from "../Guide";
import LogoutButton from "../Buttons/LogoutButton";

export function MobileMenu() {
  const pathname = usePathname();

  const primaryMenuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/create",
      label: "Create",
      icon: PlusCircle,
      active: pathname === "/create",
    },
    {
      href: "/edit",
      label: "Edit Image",
      icon: Edit,
      active: pathname === "/edit",
    },
    {
      href: "/payment/transactions",
      label: "Transactions",
      icon: CreditCard,
      active: pathname === "/payment/transactions",
    },
  ];

  const secondaryMenuItems = [
    { href: "/connected-accounts", label: "Connected Accounts" },
    { href: "/upgrade", label: "Pricing" },
  ];

  return (
    <div className="flex flex-col h-full py-2">
      <div className="mb-6">
        <UserProfile />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <UpgradeButton />
        <Guide />
      </div>
      <Separator className="my-2" />

      <nav className="flex-1">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Main Navigation
        </div>
        <ul className="space-y-1">
          {primaryMenuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors ${
                  item.active
                    ? "bg-emerald-600 text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="text-sm font-medium text-muted-foreground mt-6 mb-2">
          Account
        </div>
        <ul className="space-y-1">
          {secondaryMenuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Separator className="my-4" />

      <div className="mt-auto">
         <LogoutButton />
      </div>
    </div>
  );
}

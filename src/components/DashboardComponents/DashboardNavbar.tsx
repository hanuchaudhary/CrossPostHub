"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/AuthStore/useAuthStore";
import UpgradeButton from "../Buttons/UpgradeButton";
import Guide from "../Guide";
import NotificationButton from "../Buttons/NotificationsButton";
import { Profile } from "./Profile";
import { MobileMenu } from "./MobileMenu";
export default function DashboardNavbar() {
  const pathname = usePathname();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <header className="w-full flex items-center justify-between py-4 px-4 md:max-w-7xl mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-lg font-ClashDisplayMedium text-emerald-500">
            CrossPostHub.
          </span>
        </Link>
        <div className="hidden md:block">
          <UpgradeButton />
        </div>
      </div>

      <nav className="flex items-center gap-1 md:gap-4 font-ClashDisplayMedium tracking-wide">
        {[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/create", label: "Create" },
          { href: "/edit", label: "Editor" },
          { href: "/payment/transactions", label: "Transactions" },
        ].map(({ href, label }) => (
          <div className="relative" key={href}>
            <Link
              key={href}
              href={href}
              className={`lg:flex hidden select-none items-center justify-center px-2 rounded-md text-sm font-medium transition-colors hover:text-emerald-300 ${
                pathname === href ? "border-b-2 border-emerald-500 " : ""
              }`}
            >
              {label}
            </Link>
          </div>
        ))}

        {pathname === "/dashboard" ? (
          <Link href={"/create"} className="md:hidden flex items-center">
            <button className="px-2 py-1 border rounded-xl text-xs">
              Create
            </button>
          </Link>
        ) : (
          <Link href={"/dashboard"} className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
        )}

        <div className="lg:hidden md:flex hidden items-center gap-2">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/create", label: "Create" },
            { href: "/edit", label: "Edit" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className=""
            >
              <button className={`px-2 py-1 border-b-2 ${pathname === href ? "border-emerald-500" : ""} rounded-xl text-xs`}>
                {label}
              </button>
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <Guide />
        </div>

        <NotificationButton />

        <div className="hidden lg:block">
          <Profile />
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px]">
              <MobileMenu />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

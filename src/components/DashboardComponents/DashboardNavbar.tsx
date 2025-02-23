"use client";

import React from "react";
import Guide from "../Guide";
import { Menu, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenu } from "./MobileMenu";
import { Profile } from "./Profile";
import { useAuthStore } from "@/store/AuthStore/useAuthStore";
import UpgradeButton from "../Buttons/UpgradeButton";
import { useSession } from "next-auth/react";
import SSEListener from "../Tools/SSEListner";
import NotificationButton from "../Buttons/NotificationsButton";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { data } = useSession();

  const { fetchUser } = useAuthStore();
  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-between md:py-6 py-4 px-4 sm:px-6 lg:px-8">
      <SSEListener userId={data?.user.id!} />
      <div className="flex items-center space-x-4">
        <Link
          href={"/dashboard"}
          className="text-xl text-emerald-500 font-ClashDisplayMedium"
        >
          CrossPost Hub.
        </Link>
        <div className="md:block hidden">
          <UpgradeButton />
        </div>
      </div>
      <div className="flex items-center md:space-x-4 space-x-1">
        <Link href={"/edit"}>
          <span className="md:block hidden uppercase font-semibold text-sm hover:text-emerald-500 transition-colors duration-200">
            Edit Image
          </span>
        </Link>
        {pathname === "/dashboard" ? (
          <div>
            <Link replace href={"/create"}>
              <span className="md:block hidden uppercase font-semibold text-sm hover:text-emerald-500 transition-colors duration-200">
                Create
              </span>
            </Link>
            <Link href={"/create"}>
              <span className="md:hidden block leading-none">Create</span>
            </Link>
          </div>
        ) : (
          <div>
            <Link href={"/dashboard"}>
              <span className="md:block hidden uppercase font-semibold text-sm hover:text-emerald-500 transition-colors duration-200">
                Dashboard
              </span>
            </Link>
            <Link href={"/dashboard"}>
              <span className="md:hidden block">
                <ArrowLeftIcon />
              </span>
            </Link>
          </div>
        )}
        <div className="md:block hidden">
          <Guide />
        </div>
        <div className="md:block hidden">
          <Profile />
        </div>
        <div className="md:block hidden">
          <NotificationButton />
        </div>
        <div className="md:hidden block">
          <Sheet>
            <SheetTrigger asChild>
              <span>
                <Menu className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle menu</span>
              </span>
            </SheetTrigger>
            <SheetContent>
              <MobileMenu />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

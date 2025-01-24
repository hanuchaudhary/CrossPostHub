"use client";

import React from "react";
import { Button } from "../ui/button";
import Guide from "../Guide";
import { Menu, ArrowLeftIcon } from "lucide-react";
import { UserProfile } from "./UserProfile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenu } from "./MobileMenu";
import { Profile } from "./Profile";

export default function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-between md:py-6 py-4 px-4 sm:px-6 lg:px-8">
      <Link
        href={"/dashboard"}
        className="text-xl text-emerald-500 font-ClashDisplayMedium"
      >
        CrossPost Hub.
      </Link>
      <div className="flex items-center md:space-x-2 space-x-1">
        {pathname === "/dashboard" ? (
          <div>
            <Link replace href={"/create"}>
              <Button className="md:block hidden" variant={"default"}>
                Create Post
              </Button>
            </Link>
            <Link href={"/create"}>
              <Button
                className="md:hidden block leading-none"
                variant={"outline"}
              >
                Post
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <Link href={"/dashboard"}>
              <Button className="md:block hidden" variant={"outline"}>
                Dashboard
              </Button>
            </Link>
            <Link href={"/dashboard"}>
              <Button className="md:hidden block" variant={"outline"}>
                <ArrowLeftIcon />
              </Button>
            </Link>
          </div>
        )}
        <div className="md:block hidden">
          <Guide />
        </div>
        <div className="md:block hidden">
          <Profile />
        </div>
        <div className="md:hidden block">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Menu className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle menu</span>
              </Button>
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

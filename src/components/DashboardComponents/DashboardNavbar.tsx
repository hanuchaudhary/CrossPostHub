"use client"

import React from "react"
import { Button } from "../ui/button"
import Guide from "../Guide"
import { Menu, ArrowLeftIcon } from "lucide-react"
import { UserProfile } from "./UserProfile"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MobileMenu } from "./MobileMenu"

export default function DashboardNavbar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-between md:py-6 py-4 px-4 sm:px-6 lg:px-8">
      <Link href={"/dashboard"} className="text-xl text-emerald-500 font-ClashDisplayMedium">
        CrossPost Hub.
      </Link>
      <div className="flex items-center md:space-x-2 space-x-1">
        {pathname === "/dashboard" ? (
          <div>
            <Link href={"/create"}>
              <Button className="md:block hidden" variant={"default"}>
                Create Post
              </Button>
            </Link>
            <Link href={"/create"}>
              <Button className="md:hidden block leading-none" variant={"outline"}>
                Post
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <Button className="md:block hidden" onClick={() => router.back()} variant={"outline"}>
              Dashboard
            </Button>
            <Button className="md:hidden block" onClick={() => router.back()} variant={"outline"}>
              <ArrowLeftIcon/>
            </Button>
          </div>
        )}
        <div className="md:block hidden">
          <Guide />
        </div>
        <div className="md:block hidden">
          <UserProfile />
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
  )
}


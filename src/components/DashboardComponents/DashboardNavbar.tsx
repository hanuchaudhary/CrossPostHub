import React from "react";
import { Button } from "../ui/button";
import Guide from "../Guide";
import { Pen } from "lucide-react";
import { UserProfile } from "./UserProfile";
import Link from "next/link"

export default function DashboardNavbar() {
  return (
    <div className="max-w-7xl mx-auto flex items-center justify-between md:py-6 py-4 px-4 sm:px-6 lg:px-8">
      <Link href={"/dashboard"} className="text-xl font-ClashDisplayMedium ">CrossPost Hub.</Link>
      <div className="flex items-center md:space-x-2 space-x-1">
        <div>
          <Link href={"/create"}>
            <Button className="md:block hidden" variant={"default"}>
              Create Post
            </Button>
          </Link>
          <Link href={"/create"}>
            <Button
              className="md:hidden block"
              variant={"secondary"}
              size={"sm"}
            >
              <Pen />
            </Button>
          </Link>
        </div>
        <Guide />
        <UserProfile />
      </div>
    </div>
  );
}

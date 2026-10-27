import React from "react";
import NavItems from "@/components/landing/nav-items";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import MobileNavbar from "@/components/landing/mobile-navbar";
import { ThemeToggle } from "@/components/tools/theme-toggle";

export default function Navbar() {
  return (
    <header className="flex fixed z-40 rounded-b-3xl backdrop-blur-lg top-0 left-0 w-full items-center justify-between mx-auto py-4 px-4 sm:px-6 lg:px-28">
      <Link
        to=" /"
        className="font-ClashDisplayMedium text-emerald-500 text-xl"
      >
        CrosspostHub
      </Link>
      <div className="md:block hidden">
        <NavItems />
      </div>
      <div className="md:hidden flex items-center gap-2">
        <Link to="/signin">
          <Button variant={"default"} size={"sm"}>
            Signin
          </Button>
        </Link>
        <ThemeToggle />
        <MobileNavbar />
      </div>
    </header>
  );
}

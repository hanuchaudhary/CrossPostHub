import React from "react";
// import MobileNav from "./MobileNav";
import NavItems from "./NavItems";
import Link from "next/link";
import { Button } from "../ui/button";
import MobileNavbar from "./MobileNavbar";
import { ThemeToggle } from "../Tools/ThemeToggle";

export default function Navbar() {
  return (
    <header className="flex fixed z-40 rounded-b-3xl backdrop-blur-lg top-0 left-0 w-full items-center justify-between mx-auto py-4 px-4 sm:px-6 lg:px-28">
      <Link
        href="/"
        className="font-ClashDisplayMedium text-emerald-500 text-xl"
      >
        CrosspostHub
      </Link>
      <div className="md:block hidden">
        <NavItems />
      </div>
      <div className="md:hidden flex items-center gap-2">
        <Link href="/signin">
          <Button variant={"default"} size={"sm"}>
            Signin
          </Button>
        </Link>
        <ThemeToggle />
        {/* <MobileNav /> */}
        <MobileNavbar />
      </div>
    </header>
  );
}

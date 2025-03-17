import React from "react";
import MobileNav from "./MobileNav";
import NavItems from "./NavItems";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex fixed z-[9999] rounded-b-3xl backdrop-blur-lg top-0 left-0 w-full items-center justify-between mx-auto py-4 px-4 sm:px-6 lg:px-28">
      <Link
        href="/"
        className="font-ClashDisplayMedium text-emerald-500 text-xl"
      >
        CrossPost Hub.
      </Link>
      <div className="md:block hidden">
        <NavItems />
      </div>
      <div className="md:hidden block">
        <MobileNav />
      </div>
    </header>
  );
}

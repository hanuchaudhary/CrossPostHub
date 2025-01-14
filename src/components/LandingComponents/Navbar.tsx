import React from "react";
import MobileNav from "./MobileNav";
import NavItems from "./NavItems";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <h1 className="font-ClashDisplayMedium text-xl">CrossPost Hub.</h1>
      <div className="md:block hidden">
        <NavItems/>
      </div>
      <div className="md:hidden block">
        <MobileNav />
      </div>
    </header>
  );
}

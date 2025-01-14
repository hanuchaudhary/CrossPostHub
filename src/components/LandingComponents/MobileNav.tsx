"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Github, Menu } from "lucide-react";
import { useTheme } from "next-themes";

export default function MobileNav() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <h1 className="font-ClashDisplayMedium text-xl">CrossPost Hub.</h1>
            <SheetDescription className="text-neutral-500 dark:text-neutral-400">
              All your social media in one place.
            </SheetDescription>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col mt-10">
          <h1 className="font-semibold">Get Started</h1>
          <h1 className="font-semibold">Learn More</h1>
          <h1 className="font-semibold">Pricing</h1>
        </div>
        {/* <NavItems /> */}
        <SheetFooter className="absolute px-2 gap-4 flex-col text-neutral-500 dark:text-neutral-400 flex items-center justify-center bottom-2 left-0 w-full">
          <Button
            onClick={toggleTheme}
            size={"sm"}
            variant={"outline"}
            className="font-semibold w-full"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
          <div className="flex">
            <Github className="h-4 w-4 mr-1" />
            <a
              href="https://github.com/hanuchaudhary"
              target="_blank"
              className="underline text-sm"
            >
              github/hanuchaudhary
            </a>
            <span>❤️</span>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

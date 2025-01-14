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
import NavItems from "./NavItems";

export default function MobileNav() {
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
        <SheetFooter className="absolute text-neutral-500 dark:text-neutral-400 flex items-center flex-row justify-center bottom-2 left-0 w-full">
          <Github className="h-4 w-4 mr-1" />
          <a
            href="https://github.com/hanuchaudhary"
            target="_blank"
            className="underline text-sm"
          >
            github/hanuchaudhary
          </a>
          <span>❤️</span>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

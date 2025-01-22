"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Guide() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Guide</Button>
      </SheetTrigger>
      <SheetContent className="max-w-sm sm:max-w-3xl">
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
       
      </SheetContent>
    </Sheet>
  );
}

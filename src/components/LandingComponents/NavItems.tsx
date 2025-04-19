"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../Tools/ThemeToggle";
import Link from "next/link";
import Guide from "../Guide";

export default function NavItems() {
  return (
    <nav className="flex items-center space-x-3">
      <Link href={"/signin"}>
        <Button className="rounded-xl" size="sm">
          Try it Free
        </Button>
      </Link>
      <Link href={"/edit/code"}>
        <Button className="rounded-xl" size="sm">
          Editor
        </Button>
      </Link>
      <Guide />
      <ThemeToggle />
    </nav>
  );
}

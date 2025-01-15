"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../Tools/ThemeToggle";

export default function NavItems() {
  return (
    <nav className="flex items-center space-x-4">
      <Button size="sm">Try it Free</Button>
      <ThemeToggle />
    </nav>
  );
}

"use client";

import React from "react";
import { Camera, Code2, Twitter, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Screenshot",
    icon: Camera,
    href: "/edit/screenshot",
    mode: "screenshot"
  },
  {
    title: "Tweet",
    icon: Twitter,
    href: "/edit/tweet",
    mode: "tweet"
  },
  {
    title: "Code",
    icon: Code2,
    href: "/edit/code",
    mode: "code"
  },
  {
    title: "Mockup",
    icon: Monitor,
    href: "/edit/mockup",
    mode: "mockup"
  },
  {
    title: "Dashboard",
    icon: Monitor,
    href: "/dashboard",
    mode: "dashboard"
  }
];

export function EditorNavbar() {
  const pathname = usePathname();
  const activeMode = pathname.split('/').pop() || 'screenshot';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-background/80 backdrop-blur-xl border rounded-full px-4 py-2 flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.mode} href={item.href}>
              <Button
                variant={activeMode === item.mode ? "secondary" : "ghost"}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.title}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

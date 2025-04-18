"use client";
import { Camera, Code2, Twitter, Monitor, icons } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { AnimatePresence } from "motion/react";
import { Button } from "../ui/button";

const navItems = [
  {
    title: "Screenshot",
    href: "/edit",
    mode: "edit",
  },
  {
    title: "Code",
    href: "/edit/code",
    mode: "code",
  },
  {
    title: "Tweet",
    href: "/edit/tweet",
    mode: "tweet",
  },
  {
    title: "Mockup",
    href: "/edit/mockup",
    mode: "mockup",
  },
];

export function EditorNavbar() {
  const pathname = usePathname();
  const activeMode = pathname.split("/").pop();

  // Find the active item index for animation
  const activeIndex = navItems.findIndex((item) => item.mode === activeMode);

  return (
    <div className="flex gap-2 items-center">
      <Link href={"/dashboard"}>
        <Button variant={"secondary"} className="py-5">
          Back to dashboard
        </Button>
      </Link>
      <div className="bg-secondary/30 border flex items-center gap-2 rounded-xl p-1.5 relative">
        {activeIndex !== -1 && (
          <motion.div
            className="absolute h-[80%] rounded-lg"
            initial={false}
            animate={{
              left: `calc(${activeIndex * 25}% + 0.25rem)`,
              width: `calc(25% - 0.5rem)`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        )}

        {navItems.map((item) => {
          const isActive = activeMode === item.mode;

          return (
            <Link key={item.mode} href={item.href} className=" z-10">
              <button
                className={`flex items-center justify-center gap-1 rounded-lg w-full relative py-1 px-3 ${
                  isActive ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <span className="text-sm">{item.title}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

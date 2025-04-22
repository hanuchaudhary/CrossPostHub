"use client";
import { Camera, Code2, Twitter, Monitor, icons, ArrowLeft } from "lucide-react";
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
    <div className="flex md:gap-2 items-center">
      <Link href={"/dashboard"}>
        <Button variant={"secondary"} className="md:py-4 p-3 md:flex hidden">
          <ArrowLeft/>
        </Button>
        <Button variant={"ghost"} className="md:py-4 p-3 md:hidden flex items-center justify-center">
          <ArrowLeft/>
        </Button>
      </Link>
      <div className="bg-secondary/30 border flex items-center gap-2 rounded-xl p-1 relative">
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
                <span className="md:text-sm text-xs">{item.title}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

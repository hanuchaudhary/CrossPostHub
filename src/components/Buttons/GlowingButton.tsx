"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingButtonProps {
  children: React.ReactNode | string;
  href: string;
  className?: string;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "emerald";
}

const colorMap = {
  blue: "59, 130, 246",
  green: "34, 197, 94",
  red: "239, 68, 68",
  yellow: "234, 179, 8",
  purple: "168, 85, 247",
  emerald: "16, 185, 129",
};

export function GlowingButton({
  children,
  href,
  className,
  color = "blue",
}: GlowingButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-block font-ClashDisplayMedium rounded-xl",
        "transition-colors duration-300 ease-in-out px-4 py-1 relative group",
        `bg-${color}-500/10 border border-${color}-500 text-${color}-500`,
        `hover:bg-${color}-400/10 hover:border-${color}-400 hover:text-${color}-400`,
        className
      )}
    >
      <Link href={href} className="block text-sm relative z-10">
        {children}
      </Link>
      <motion.span
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out",
          `bg-${color}-500`
        )}
        animate={{
          boxShadow: [
            `0 0 0 0 rgba(${colorMap[color]}, 0)`,
            `0 0 0 10px rgba(${colorMap[color]}, 0.3)`,
            `0 0 0 20px rgba(${colorMap[color]}, 0)`,
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    </motion.div>
  );
}

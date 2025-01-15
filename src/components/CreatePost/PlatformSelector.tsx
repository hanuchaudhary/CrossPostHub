"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Platform = "instagram" | "twitter" | "linkedin";

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
}

const platforms: { id: Platform; icon: string; name: string }[] = [
  { id: "instagram", icon: "/instagram.svg", name: "Instagram" },
  { id: "twitter", icon: "/twitter.svg", name: "Twitter" },
  { id: "linkedin", icon: "/linkedin.svg", name: "LinkedIn" },
];

export function PlatformSelector({
  selectedPlatforms,
  setSelectedPlatforms,
}: PlatformSelectorProps) {
  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleRemoveItem = (e: React.MouseEvent<SVGSVGElement>) => {
    const platform = e.currentTarget.previousSibling?.textContent;
    if (platform) {
      setSelectedPlatforms((prev) => prev.filter((p) => p !== platform));
    }
  };

  return (
    <>
      <h1 className="font-ClashDisplayMedium leading-none text-lg">
        Select Platforms
      </h1>
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {platforms.map((platform) => (
          <motion.button
            key={platform.id}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl bg-secondary/50 shadow-lg transition-all duration-300 ease-in-out",
              selectedPlatforms.includes(platform.id)
                ? "border-2 border-emerald-300/50"
                : "border-2 border-neutral-200 dark:border-neutral-700"
            )}
            onClick={() => togglePlatform(platform.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={platform.icon || "/placeholder.svg"}
              className={cn(
                "transition-all duration-300 ease-in-out",
                platform.id === "twitter" && "dark:invert-[1]"
              )}
              alt={platform.id}
              width={80}
              height={80}
            />
          </motion.button>
        ))}
      </motion.div>
      {selectedPlatforms.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Please select at least one platform
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {selectedPlatforms.map((platform) => (
            <p
              key={platform}
              className="select-none capitalize text-sm bg-secondary/80 border border-secondary px-2 py-1 rounded-md text-primary/70"
            >
              {platform}
            </p>
          ))}{" "}
          <p
            onClick={() => {
              setSelectedPlatforms([]);
            }}
            className="select-none capitalize text-sm bg-destructive/10 border border-destructive/20 px-2 py-1 rounded-md text-destructive"
          >
            Clear All
          </p>
        </div>
      )}
    </>
  );
}

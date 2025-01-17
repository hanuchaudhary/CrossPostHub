"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-ClashDisplayMedium text-primary">Select Platforms</h2>
      <div className="flex gap-4">
        {platforms.map((platform) => (
          <motion.button
            key={platform.id}
            className={cn(
              "flex items-center justify-center p-2 rounded-xl transition-all duration-300 ease-in-out",
              selectedPlatforms.includes(platform.id)
                ? "bg-primary/10 ring-2 ring-primary"
                : "bg-secondary hover:bg-secondary/80"
            )}
            onClick={() => togglePlatform(platform.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={platform.icon || "/placeholder.svg"}
              alt={platform.name}
              width={40}
              height={40}
              className={cn(
                "transition-all duration-300 ease-in-out",
                platform.id === "twitter" && "dark:invert"
              )}
            />
            <span className="mt-2 text-sm font-medium">{platform.name}</span>
          </motion.button>
        ))}
      </div>
      {selectedPlatforms.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Selected Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((platform) => (
              <motion.span
                key={platform}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                {platform}
                <X
                  className="ml-2 h-4 w-4 cursor-pointer"
                  onClick={() => togglePlatform(platform)}
                />
              </motion.span>
            ))}
          </div>
        </div>
      )}
      {selectedPlatforms.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Please select at least one platform
        </p>
      )}
    </div>
  );
}


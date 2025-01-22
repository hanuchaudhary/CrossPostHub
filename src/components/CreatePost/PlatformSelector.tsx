"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStoreStore";
import { Skeleton } from "../ui/skeleton";

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
  const togglePlatform = (app: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(app) ? prev.filter((p) => p !== app) : [...prev, app]
    );
  };

  const { isFetchingApps, connectedApps, fetchConnectedApps } =
    useDashboardStore();

  React.useEffect(() => {
    fetchConnectedApps();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-ClashDisplayMedium text-primary">
        Select Platforms
      </h2>
      <div className="flex gap-4">
        {isFetchingApps || connectedApps.length < 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-16 rounded-xl" />
            ))
          : connectedApps.map((app) => (
              <motion.button
                key={app.id_token}
                className={cn(
                  "flex items-center justify-center p-2 rounded-xl transition-all duration-300 ease-in-out",
                  selectedPlatforms.includes(app.provider as Platform)
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-secondary hover:bg-secondary/80"
                )}
                onClick={() => togglePlatform(app.provider as Platform)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={`/${app.provider}.svg` || "/placeholder.svg"}
                  alt={app.provider!}
                  width={40}
                  height={40}
                  className={cn(
                    "transition-all duration-300 ease-in-out", app.provider === "twitter" && "dark:invert"
                  )}
                />
                <span className="mt-2 text-sm font-medium capitalize">
                  {app.provider}
                </span>
              </motion.button>
            ))}
      </div>
      {selectedPlatforms.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((app) => (
              <motion.span
                key={app}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                {app}
                <X
                  className="ml-2 h-4 w-4 cursor-pointer"
                  onClick={() => togglePlatform(app)}
                />
              </motion.span>
            ))}
          </div>
        </div>
      )}
      {selectedPlatforms.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Please select at least one app
        </p>
      )}
    </div>
  );
}

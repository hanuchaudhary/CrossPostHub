"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLatestSubscription } from "@/hooks/useLatestSubscription";

export default function UpgradeButton() {
  const { subscription } = useLatestSubscription();

  return (
    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={"/upgrade"}
        replace
        className="font-ClashDisplayMedium bg-yellow-500/10 rounded-xl leading-none border border-yellow-500 px-4 py-1 md:text-sm text-xs text-yellow-500 hover:text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 transition-colors duration-300 ease-in-out relative inline-block group"
      >
        <span className="relative z-10">
          {subscription?.plan.title ? subscription.plan.title : "Upgrade"}
        </span>
        <motion.span
          className="absolute inset-0 rounded-xl bg-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0)",
              "0 0 0 10px rgba(59, 130, 246, 0.3)",
              "0 0 0 20px rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
      </Link>
    </motion.span>
  );
}

"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { GlowingButton } from "./GlowingButton";

export default function NoAppButton() {
  return (
    <div className="select-none h-96 w-full flex items-center justify-center">
      <p className="font-ClashDisplayMedium bg-neutral-400/10 rounded-2xl space-x-4 leading-none border border-secondary pl-3 pr-2 py-2 md:text-sm text-xs text-neutral-400">
        <span className="">No Connected Apps Available</span>
        {/* <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={"/dashboard"}
            replace
            className="font-ClashDisplayMedium bg-emerald-500/10 rounded-xl leading-none border border-emerald-500 px-4 py-2 md:text-sm text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400 transition-colors duration-300 ease-in-out relative inline-block group"
          >
            <span className="relative z-10">Connect App?</span>
            <motion.span
              className="absolute inset-0 rounded-xl bg-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0)",
                  "0 0 0 10px rgba(16, 185, 129, 0.1)",
                  "0 0 0 20px rgba(16, 185, 129, 0)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            />
          </Link>
        </motion.span> */}
        <GlowingButton href="/dashboard" color="emerald">
          Connect App?
        </GlowingButton>
      </p>
    </div>
  );
}

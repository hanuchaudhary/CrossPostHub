"use client";

import React from "react";
import Link from "next/link";
import Guide from "../Guide";
import { motion } from "motion/react";
import Aurora from "./AuororaBg";
import { useTheme } from "next-themes";
import LiquidChrome from "./LiquidChrome";
import BubbleButton from "../Buttons/BubbleButton";

export default function Home() {
  const { theme } = useTheme();
  return (
    <div className="flex relative flex-col rounded-[30px] md:max-w-6xl mx-auto my-5 gap-10 md:gap-[100px] pb-[50px] md:pb-0 md:flex-row items-center justify-center flex-grow bg-transparent selection:bg-emerald-950 selection:text-emerald-400 dark:overflow-hidden">
      <div className="z-10 relative text-whit flex flex-col items-center justify-center w-full px-4 md:px-0">
        <div className="font-ClashDisplayMedium max-w-4xl text-center leading-none pt-10 md:pt-20">
          <div className="border inline-block font-ClashDisplayRegular px-4 py-2 backdrop-blur-xl border-primary/30 text-xs md:text-sm mb-8 rounded-full">
            <span>Post Once, Publish Everywhere🎉</span>
          </div>
          <h1 className="text-[40px] leading-none sm:text-[80px] lg:text-[80px]">
            Create, Schedule, and{" "}
            <span className="text-orange-500">Publish</span> Across All
            Platforms in Seconds!
          </h1>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center px-4 font-ClashDisplayRegular md:text-xl dark:text-neutral-300 my-10"
        >
          Effortlessly share content to LinkedIn, Twitter, Instagram and more{" "}
          <span className="text-orange-500">—all at once.</span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center w-full justify-center md:py-20 md:gap-3 gap-1"
        >
          <Link href="/register">
            <BubbleButton />
          </Link>
          <div className="mb-1">
            <Guide size={"xl"} title="Learn How it works" />
          </div>
        </motion.div>
      </div>
      {theme === "dark" ? (
        <div className="absolute top-0 left-0 w-full h-full">
          <Aurora colorStops={["#00D8FF", "#7BFF67", "#00D8FF"]}  />
        </div>
      ) : (
        <div className="absolute rounded-[30px] border-secondary/80 overflow-hidden opacity-50 border-t-[7px] border-x-[7px] top-0 left-0 w-full h-full">
          <LiquidChrome
            color={[1, 1, 1]}
            mouseReact={false}
            amplitude={0.1}
            speed={1.0}
          />
          <div className="sticky -bottom-10 blur-xl left-0 h-32 w-full bg-white"></div>
        </div>
      )}
    </div>
  );
}

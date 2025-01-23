"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Guide from "../Guide";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      initial={{ filter: "blur(10px)" }}
      animate={{ filter: "blur(0px)" }}
      transition={{ duration: 0.5 }}
      className="flex flex-col bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-800/40 rounded-[30px] md:max-w-7xl mx-auto my-5 gap-10 md:gap-[100px] pb-[50px] md:pb-0 md:flex-row items-center justify-center flex-grow selection:bg-primary selection:text-primary-foreground"
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-ClashDisplaySemibold text-center leading-none pt-10 md:pt-20"
        >
          <h1 className="text-[40px] sm:text-[80px] lg:text-[105px]">
            Create Once,
          </h1>
          <h1 className="text-orange-500 text-[40px] sm:text-[80px] lg:text-[100px]">
            Share Everywhere!
          </h1>
        </motion.div>
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
          className="flex items-center px-4 w-full justify-center md:py-20 gap-3"
        >
          <Link href="/register" replace>
            <Button size={"xl"}>Start Now</Button>
          </Link>
          <Guide size={"xl"} title="Learn How it works" />
        </motion.div>
      </div>
    </motion.div>
  );
}

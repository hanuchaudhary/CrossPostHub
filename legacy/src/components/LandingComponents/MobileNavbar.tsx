"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuVariants = {
    hidden: { opacity: 0, y: "-100%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      y: "-100%",
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (custom: any) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + custom * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  const links = [
    { href: "/dashboard", label: "Get Started" },
    { href: "/upgrade", label: "Upgrade" },
    { href: "/register", label: "Register" },
    { href: "/signin", label: "Sign In" },
  ];

  return (
    <div className="">
      <div className="flex gap-2">
        <button
          className="text-black dark:text-white z-[60] relative"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <Image
              src={"/CloseIcon.svg"}
              alt="close"
              width={30}
              height={30}
              className="h-7 w-7 invert-[1] dark:invert-[0]"
            />
          ) : (
            <Image
              src={"/MenuIcon.svg"}
              alt="menu"
              width={30}
              height={30}
              className="h-7 w-7 invert-[1] dark:invert-[0]"
            />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 font-ClashDisplayMedium bg-secondary/50 z-50 flex flex-col h-screen"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col justify-center items-center h-[70%] shadow-xl dark:bg-black bg-neutral-100 rounded-b-3xl">
              <div className="md:text-center mb-4 px-4 md:px-0">
                <motion.h1
                  className="md:text-3xl text-2xl text-emerald-500"
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  CrossPostHub
                </motion.h1>
                <motion.p
                  className="text-muted-foreground md:text-base text-sm"
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  All your social media in one place.
                </motion.p>
              </div>

              <nav className="flex flex-col items-center w-full">
                {links.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="block w-full md:px-10 px-4 py-4 md:py-6 md:text-3xl text-xl border-b border-border transition-colors dark:hover:bg-secondary hover:bg-white hover:text-emerald-500 duration-200"
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index + 2}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                className="mt-12"
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                custom={6}
              >
                <button
                  className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Close Menu
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

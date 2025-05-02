"use client";

import React from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <div>
      <motion.button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-primary-foreground/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: theme === "dark" ? 0 : 180,
          }}
          transition={{ duration: 0.3 }}
        >
          {theme === "dark" ? (
            <IconMoonFilled className="h-5 w-5" />
          ) : (
            <IconSunFilled className="h-5 w-5" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

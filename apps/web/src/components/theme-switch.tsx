import { useEffect } from "react";

import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { useTheme } from "./theme-provider";

const themes = [
  { key: "light", icon: IconSunFilled, label: "Light theme" },
  { key: "dark", icon: IconMoonFilled, label: "Dark theme" },
];

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName))
      ) {
        return;
      }

      if (
        e.key.toLowerCase() === "t" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        setTheme(theme === "dark" ? "light" : "dark");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme, setTheme]);

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        "cursor-pointer relative z-40 flex h-8 rounded-full dark:bg-background/40 bg-white backdrop-blur-sm p-1 ring-1 ring-border"
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            type="button"
            key={key}
            className="relative h-6 w-6 rounded-full cursor-pointer"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => setTheme(key as "light" | "dark")}
          >
            {isActive && (
              <motion.span
                layoutId="activeTheme"
                className="absolute inset-0 rounded-full bg-secondary"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative m-auto h-4 w-4",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

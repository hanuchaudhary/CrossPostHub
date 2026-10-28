import { useId } from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme(),
    id = useId();
  const active =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  return (
    <div
      role="group"
      aria-label="Color theme"
      className="relative flex h-8 rounded-full bg-background/80 p-1 ring-1 ring-border"
    >
      {(
        [
          { key: "light", icon: Sun01Icon, label: "Light theme" },
          { key: "dark", icon: Moon02Icon, label: "Dark theme" },
        ] as const
      ).map((item) => (
        <Button
          key={item.key}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative size-6 rounded-full p-0"
          aria-label={item.label}
          aria-pressed={active === item.key}
          onClick={() => setTheme(item.key)}
        >
          {active === item.key && (
            <motion.span
              layoutId={`active-theme-${id}`}
              className="absolute inset-0 rounded-full bg-secondary"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <HugeiconsIcon
            icon={item.icon}
            size={16}
            className={cn(
              "relative",
              active === item.key ? "text-foreground" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
        </Button>
      ))}
    </div>
  );
}

import { useId, useState } from "react";

import { LayoutGroup, motion } from "motion/react";

import { cn } from "@/lib/utils";

const SPRING = { type: "spring", bounce: 0.15, duration: 0.45 } as const;

export function Segmented<T extends string | boolean>({
  label,
  value,
  options,
  onChange,
  role = "radiogroup",
  className,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
  role?: "radiogroup" | "tablist";
  className?: string;
}) {
  const id = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const item = role === "tablist" ? "tab" : "radio";

  return (
    <LayoutGroup id={id}>
      <div
        role={role}
        aria-label={label}
        onMouseLeave={() => setHovered(null)}
        className={cn(
          "relative flex w-fit rounded-lg bg-secondary/60 p-0.5 ring-1 ring-border/60",
          className
        )}
      >
        {options.map((option) => {
          const key = String(option.id);
          const active = value === option.id;
          return (
            <button
              key={key}
              type="button"
              role={item}
              aria-checked={item === "radio" ? active : undefined}
              aria-selected={item === "tab" ? active : undefined}
              onClick={() => onChange(option.id)}
              onMouseEnter={() => setHovered(key)}
              onFocus={() => setHovered(key)}
              className={cn(
                "relative cursor-pointer rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {hovered === key && (
                <motion.span
                  layoutId="hover"
                  className="absolute inset-0 rounded-md bg-foreground/5"
                  transition={SPRING}
                />
              )}
              {active && (
                <motion.span
                  layoutId="active"
                  className="absolute inset-0 rounded-md bg-background ring-1 ring-border"
                  transition={SPRING}
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

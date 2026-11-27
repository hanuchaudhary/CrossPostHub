import { useId } from "react";

import { motion } from "motion/react";

import { cn } from "cn";

export type FilterTabOption<T extends string> = {
  key: T;
  label: string;
  count?: number;
};

/** Pill tab bar for filtering a list, with an optional count per tab. */
export function FilterTabs<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: FilterTabOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const layoutId = useId();

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "relative flex h-10 w-fit max-w-full overflow-x-auto rounded-full bg-secondary p-1 ring-1 ring-border [scrollbar-width:none] md:h-11",
        className
      )}
    >
      {options.map(({ key, label, count }) => {
        const active = value === key;
        return (
          <button
            type="button"
            role="tab"
            key={key}
            aria-selected={active}
            onClick={() => onChange(key)}
            className="relative flex shrink-0 cursor-pointer items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary shadow-[inset_0_0_3px_rgba(255,255,255,1)]"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span
              className={cn(
                "relative flex items-center gap-1.5 px-2.5 text-xs transition-colors md:px-4 md:text-sm",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              {count != null && (
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 tabular-nums",
                    active
                      ? "bg-primary-foreground/15"
                      : "bg-background/60 dark:bg-background/40"
                  )}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

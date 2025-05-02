"use client";

import type React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface CollapsibleProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  open?: boolean; // Controlled open state
  onOpenChange?: (isOpen: boolean) => void; // Callback to notify parent of state changes
}

export function Collapsible({
  trigger,
  children,
  className,
  buttonClassName,
  contentClassName,
  open = false,
  onOpenChange,
}: CollapsibleProps) {
  // No internal useState; use the controlled `open` prop directly
  const handleToggle = () => {
    const newOpenState = !open;
    onOpenChange?.(newOpenState); // Notify parent of the toggle
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="border rounded-2xl overflow-hidden bg-secondary/30">
        <button
          className={cn("w-full text-sm py-2", buttonClassName)}
          onClick={handleToggle}
        >
          {trigger}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                transition: {
                  // height: {
                  //   type: "inertia",
                  //   stiffness: 500,
                  //   damping: 30,
                  // },
                  opacity: { duration: 0.2 },
                },  
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  height: { duration: 0.2 },
                  opacity: { duration: 0.2 },
                },
              }}
              className={cn("overflow-hidden", contentClassName)}
            >
              <div className="pb-3 px-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
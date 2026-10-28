import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

import { queryClient } from "@/lib/query";

import { ThemeProvider } from "../theme-provider";
import { TooltipProvider } from "../ui/tooltip";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            {children}
            <Toaster
              toastOptions={{
                style: {
                  borderRadius: "100px",
                },
              }}
              // duration={80 * 70 * 70}
              position="top-center"
            />
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

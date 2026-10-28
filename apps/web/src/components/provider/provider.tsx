import { MotionConfig } from "motion/react";
import { TooltipProvider } from "../ui/tooltip";
import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "../theme-provider";
import { queryClient } from "@/lib/query";
export function Provider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

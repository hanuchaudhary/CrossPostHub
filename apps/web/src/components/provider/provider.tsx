import type { ReactNode } from "react";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";

import { ConfirmProvider } from "@/components/confirm-dialog";
import { SoundEffects } from "@/components/ui/sound";
import { Toasts } from "@/components/ui/toast";
import { queryClient } from "@/lib/query";

import { ThemeProvider } from "../theme-provider";
import { TooltipProvider } from "../ui/tooltip";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <MotionConfig reducedMotion="user">
          <DirectionProvider>
            <SoundEffects>
              <TooltipProvider>
                <ConfirmProvider>
                  {children}
                  <Toasts position="top-center" />
                </ConfirmProvider>
              </TooltipProvider>
            </SoundEffects>
          </DirectionProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

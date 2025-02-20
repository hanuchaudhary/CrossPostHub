import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ToolButtonProps extends React.ComponentProps<typeof Button> {
  isActive?: boolean;
  tooltip?: string;
}

export function ToolButton({
  isActive,
  className,
  tooltip,
  children,
  ...props
}: ToolButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground",
              className
            )}
            {...props}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

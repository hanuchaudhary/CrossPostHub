import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ControlPopoverProps {
  triggerIcon?: React.ReactNode;
  toolkitTitle: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function ControlPopover({
  triggerIcon,
  children,
  toolkitTitle,
  className,
  title,
}: ControlPopoverProps) {
  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <button>
            <TriggerButton
              icon={triggerIcon}
              toolkitTitle={toolkitTitle!}
              title={title!}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-80 p-4 pb-6" sideOffset={20}>
          {children}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

function TriggerButton({
  icon,
  toolkitTitle,
  title,
}: {
  title: string
  icon: React.ReactNode;
  toolkitTitle: string;
}) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div>
          {icon && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full hover:bg-accent hover:text-accent-foreground"
            >
              {icon}
            </Button>
          )}
          {title && (
            <Button className="rounded-full" variant="outline">
              {title}
            </Button>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="pointer-events-none">
        {toolkitTitle}
      </TooltipContent>
    </Tooltip>
  );
}

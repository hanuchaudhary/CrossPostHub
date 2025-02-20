import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface ControlPopoverProps {
  triggerIcon: React.ReactNode
  children: React.ReactNode
  className?: string
  title: string
}

export function ControlPopover({ triggerIcon, children, className, title }: ControlPopoverProps) {
  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <button>
            <TriggerButton icon={triggerIcon} title={title} />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-80 p-4 pb-6" sideOffset={20}>
          {children}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

function TriggerButton({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="pointer-events-none">{title}</TooltipContent>
    </Tooltip>
  )
}

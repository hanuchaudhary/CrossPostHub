import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ControlPopoverProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}

export function ControlPopover({ icon, title, children, className }: ControlPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full hover:bg-accent hover:text-accent-foreground",
            className
          )}
        >
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        className="w-80 p-4"
        sideOffset={20}
      >
        <div className="space-y-4">
          <h4 className="font-medium leading-none">{title}</h4>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}

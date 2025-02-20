import type * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ToolButtonProps extends React.ComponentProps<typeof Button> {
  isActive?: boolean
}

export function ToolButton({ isActive, className, children, ...props }: ToolButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-full",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}


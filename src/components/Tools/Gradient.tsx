import { cn } from "@/lib/utils"

interface GradientProps {
  bottom?: string
  right?: string
  height?: string
  width?: string
  color?: string
  opacity?: number
  blur?: string
  className?: string
}

export function Gradient({
  bottom = "40px",
  right = "40px",
  height = "24rem",
  width = "24rem",
  color = "#25DFB3",
  opacity = 0.8,
  blur = "210px",
  className,
}: GradientProps) {
  return (
    <div
      className={cn("absolute hidden dark:block rounded-full", "md:block", className)}
      style={{
        bottom: `calc(-1 * ${bottom})`,
        right: `calc(-1 * ${right})`,
        height,
        width,
        backgroundColor: color,
        opacity,
        filter: `blur(${blur})`,
        zIndex: -1,
      }}
    />
  )
}


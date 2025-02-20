import { cn } from "@/lib/utils"

interface PositionGridProps {
  value: { x: number; y: number }
  onChange: (position: { x: number; y: number }) => void
  className?: string
}

export function PositionGrid({ value, onChange, className }: PositionGridProps) {
  const gridSize = 5
  const canvasWidth = 800
  const canvasHeight = 600

  const calculatePosition = (row: number, col: number) => ({
    x: (col + 1) * (canvasWidth / (gridSize + 1)),
    y: (row + 1) * (canvasHeight / (gridSize + 1)),
  })

  const getCurrentCell = () => {
    const col = Math.round((value.x / canvasWidth) * (gridSize + 1)) - 1
    const row = Math.round((value.y / canvasHeight) * (gridSize + 1)) - 1
    return { row, col }
  }

  const current = getCurrentCell()

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const row = Math.floor(index / gridSize)
          const col = index % gridSize
          const isSelected = row === current.row && col === current.col

          return (
            <button
              key={index}
              className={cn(
                "aspect-square bg-muted-foreground rounded-lg transition-all duration-200",
                "hover:bg-indigo-500 hover:border-muted-foreground",
                isSelected ? "bg-indigo-500 border-4 border-muted-foreground" : "",
              )}
              onClick={() => onChange(calculatePosition(row, col))}
            />
          )
        })}
      </div>
    </div>
  )
}


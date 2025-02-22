import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Canvas, util } from "fabric";
import { Move } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface PositionScaleOptionsProps {
  canvas: Canvas | null;
}

export const PositionScaleOptions = ({ canvas }: PositionScaleOptionsProps) => {
  const [selectedPosition, setSelectedPosition] = useState<{ row: number; col: number } | null>(null);

  const handleScale = (value: number[]) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const scale = value[0] / 100;
    activeObject.scale(scale);
    canvas.renderAll();
  };

  const handleGridPosition = (row: number, col: number) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    setSelectedPosition({ row, col });

    const xPercent = col / 4;
    const yPercent = row / 4;

    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    const objectWidth = activeObject.getScaledWidth();
    const objectHeight = activeObject.getScaledHeight();

    const left = (canvasWidth - objectWidth) * xPercent;
    const top = (canvasHeight - objectHeight) * yPercent;

    util.animate({
      startValue: activeObject.left!,
      endValue: left,
      duration: 300,
      onChange: (value) => {
        activeObject.set('left', value);
        canvas.renderAll();
      },
      onComplete: () => {
        canvas.fire('object:modified');
      }
    });

    util.animate({
      startValue: activeObject.top!,
      endValue: top,
      duration: 300,
      onChange: (value) => {
        activeObject.set('top', value);
        canvas.renderAll();
      },
      onComplete: () => {
        canvas.fire('object:modified');
      }
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-neutral-800">
          <Move className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] bg-[#1A1F2C] border-neutral-800">
        <div className="space-y-4">
          <h3 className="font-medium">Position & Scale</h3>
          
          <div className={cn("space-y-4")}>
            <div className="grid grid-cols-5 gap-1 relative">
              {selectedPosition && (
                <motion.div
                  className="absolute bg-indigo-500 rounded-lg"
                  layoutId="selectedPosition"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                  style={{
                    width: 'calc(20% - 0.2rem)',
                    height: 'calc(20% - 0.2rem)',
                    top: `calc(${selectedPosition.row * 20}% + ${selectedPosition.row * 0.25}rem)`,
                    left: `calc(${selectedPosition.col * 20}% + ${selectedPosition.col * 0.25}rem)`,
                  }}
                />
              )}
              {Array.from({ length: 5 * 5 }).map((_, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;
                const isSelected = selectedPosition?.row === row && selectedPosition?.col === col;

                return (
                  <button
                    key={index}
                    className={cn(
                      "aspect-square rounded-lg transition-all duration-200",
                      "bg-muted-foreground hover:bg-indigo-500/50",
                      "relative z-10",
                      isSelected && "bg-transparent"
                    )}
                    onClick={() => handleGridPosition(row, col)}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Scale</label>
            <Slider
              defaultValue={[100]}
              max={200}
              min={10}
              step={1}
              onValueChange={handleScale}
            />
          </div>
          
        </div>
      </PopoverContent>
    </Popover>
  );  
};
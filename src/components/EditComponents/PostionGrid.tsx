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

interface PositionScaleOptionsProps {
  canvas: Canvas | null;
}

export const PositionGrid = ({ canvas }: PositionScaleOptionsProps) => {
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
      duration: 100,
      onChange: (value) => {
        activeObject.set("left", value);
        canvas.renderAll();
      },
    });

    util.animate({
      startValue: activeObject.top!,
      endValue: top,
      duration: 100,
      onChange: (value) => {
        activeObject.set("top", value);
        canvas.renderAll();
      },
    });

    canvas.fire("object:modified");
  };

  return (
    <div className="space-y-4">
      <div className={cn("space-y-4")}>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 5 * 5 }).map((_, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;

            return (
              <button
                key={index}
                className={cn(
                  "aspect-square bg-muted-foreground rounded-lg transition-all duration-200",
                  "hover:bg-indigo-500 hover:border-muted-foreground"
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
  );
};

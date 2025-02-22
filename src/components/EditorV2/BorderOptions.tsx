"use client";

import { useState, useEffect } from "react";
import { Canvas } from "fabric";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Frame } from "lucide-react";

interface BorderOptionsProps {
  canvas: Canvas | null;
}

export const BorderOptions = ({ canvas }: BorderOptionsProps) => {
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState(4);
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderRadius, setBorderRadius] = useState(0);

  useEffect(() => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      activeObject.set({
        stroke: borderColor,
        strokeWidth: borderWidth,
        strokeDashArray: borderStyle === "dashed" ? [10, 5] : undefined,
        rx: borderRadius,
        ry: borderRadius,
      });
      canvas?.renderAll();
    }
  }, [borderColor, borderWidth, borderStyle, borderRadius, canvas]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-gray-800">
          <Frame className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] bg-[#1A1F2C] border-gray-800">
        <div className="space-y-4">
          <h3 className="font-medium">Border</h3>
          <div>
            <label>Enabled</label>
            <input
              type="checkbox"
              checked={borderWidth > 0}
              onChange={(e) => setBorderWidth(e.target.checked ? 4 : 0)}
            />
          </div>
          <div>
            <label>Color</label>
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
            />
          </div>
          <div>
            <label>Style</label>
            <select
              value={borderStyle}
              onChange={(e) => setBorderStyle(e.target.value)}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
            </select>
          </div>
          <div>
            <label>Width</label>
            <input
              type="range"
              min="0"
              max="10"
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Radius</label>
            <input
              type="range"
              min="0"
              max="50"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

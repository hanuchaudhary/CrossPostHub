"use client";

import { useState, useEffect } from "react";
import { Canvas } from "fabric";
import { Frame } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface BorderOptionsProps {
  canvas: Canvas | null;
}

export function BorderOptions({ canvas }: BorderOptionsProps) {
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState(4);
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderRadius, setBorderRadius] = useState(0);

  useEffect(() => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "image") {
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
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="border-enabled">Border</Label>
        <Switch
          id="border-enabled"
          checked={borderWidth > 0}
          onCheckedChange={(checked) => setBorderWidth(checked ? 4 : 0)}
        />
      </div>

      <div className="grid gap-2">
        <Label>Color</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[120px] justify-start"
              style={{ backgroundColor: borderColor }}
            >
              <div
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: borderColor }}
              />
              <span className="ml-2">{borderColor}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[120px] p-2">
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label>Style</Label>
        <Select value={borderStyle} onValueChange={setBorderStyle}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>Width</Label>
          <span className="text-sm text-muted-foreground">{borderWidth}px</span>
        </div>
        <Slider
          min={0}
          max={10}
          step={1}
          value={[borderWidth]}
          onValueChange={([value]) => setBorderWidth(value)}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>Radius</Label>
          <span className="text-sm text-muted-foreground">
            {borderRadius}px
          </span>
        </div>
        <Slider
          min={0}
          max={50}
          step={1}
          value={[borderRadius]}
          onValueChange={([value]) => setBorderRadius(value)}
        />
      </div>
    </div>
  );
}

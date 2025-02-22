"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Canvas } from "fabric";
import { Expand } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ResizeOptionsProps {
  canvas: Canvas | null;
}

export const ResizeOptions = ({ canvas }: ResizeOptionsProps) => {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const handleResize = () => {
    if (!canvas) return;

    const newWidth = parseInt(width);
    const newHeight = parseInt(height);

    if (isNaN(newWidth) || isNaN(newHeight)) {
      toast({
        title: "Error",
        description: "Please enter valid dimensions",
        variant: "destructive",
      });
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;

    // Calculate scales based on canvas size constraints
    let scaleX = newWidth / activeObject.width!;
    let scaleY = newHeight / activeObject.height!;

    // If the new dimensions would exceed canvas size, adjust the scales
    if (newWidth > canvasWidth || newHeight > canvasHeight) {
      const scaleFactorW = canvasWidth / newWidth;
      const scaleFactorH = canvasHeight / newHeight;
      const scaleFactor = Math.min(scaleFactorW, scaleFactorH);

      scaleX *= scaleFactor;
      scaleY *= scaleFactor;
    }

    // Apply the adjusted scales
    activeObject.set({
      scaleX,
      scaleY,
    });

    // Center the object on the canvas
    canvas.centerObject(activeObject);
    activeObject.setCoords();

    canvas.renderAll();

    toast({
      title: "Success",
      description: "Image resized successfully",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Expand className="w-5 h-5" />
        <h3 className="text-lg font-medium">Resize</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-400">Width (px)</Label>
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="Width"
            className="bg-transparent border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-400">Height (px)</Label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Height"
            className="bg-transparent border-gray-700"
          />
        </div>
      </div>
      <Button
        onClick={handleResize}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        Resize Image
      </Button>
    </div>
  );
};

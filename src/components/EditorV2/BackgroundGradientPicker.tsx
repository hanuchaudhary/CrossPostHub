import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Canvas, Gradient } from "fabric";
import { Palette } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface BackgroundGradientPickerProps {
  canvas: Canvas | null;
}

const GRADIENTS = [
  // Solid colors
  { name: "Transparent", value: "transparent" },
  { name: "White", value: "#FFFFFF" },
  { name: "Solid Black", value: "#000000" },

  // Gradients
  {
    name: "Purple Blue",
    value: "linear-gradient(45deg, #6366f1, #3b82f6)",
  },
  {
    name: "Coral",
    value: "linear-gradient(45deg, #f43f5e, #f97316)",
  },
  {
    name: "Orange",
    value: "linear-gradient(45deg, #f97316, #eab308)",
  },
  {
    name: "Yellow",
    value: "linear-gradient(45deg, #eab308, #84cc16)",
  },
  {
    name: "Green",
    value: "linear-gradient(45deg, #84cc16, #22c55e)",
  },
  {
    name: "Teal",
    value: "linear-gradient(45deg, #22c55e, #14b8a6)",
  },
  {
    name: "Cyan",
    value: "linear-gradient(45deg, #14b8a6, #0ea5e9)",
  },
  {
    name: "Light Blue",
    value: "linear-gradient(45deg, #0ea5e9, #6366f1)",
  },
  {
    name: "Blue",
    value: "linear-gradient(45deg, #6366f1, #8b5cf6)",
  },
  {
    name: "Purple",
    value: "linear-gradient(45deg, #8b5cf6, #d946ef)",
  },
  {
    name: "Pink Purple",
    value: "linear-gradient(45deg, #d946ef, #ec4899)",
  },
  {
    name: "Pink",
    value: "linear-gradient(45deg, #ec4899, #f43f5e)",
  },
  {
    name: "Sunset",
    value: "linear-gradient(45deg, #f97316, #ec4899)",
  },
  {
    name: "Ocean",
    value: "linear-gradient(45deg, #0ea5e9, #6366f1, #d946ef)",
  },
  {
    name: "Forest",
    value: "linear-gradient(45deg, #22c55e, #14b8a6, #0ea5e9)",
  },
  {
    name: "Cotton Candy",
    value: "linear-gradient(45deg, #93c5fd, #f9a8d4)",
  },
  {
    name: "Aurora",
    value: "linear-gradient(45deg, #22d3ee, #a855f7, #f472b6)",
  },
  {
    name: "Dusk",
    value: "linear-gradient(45deg, #3b82f6, #8b5cf6, #d946ef)",
  },
];

export const BackgroundGradientPicker = ({
  canvas,
}: BackgroundGradientPickerProps) => {
  const applyGradient = (gradientValue: string) => {
    if (!canvas) return;

    if (gradientValue === "transparent") {
      canvas.backgroundColor = "";
      canvas.renderAll();
      return;
    }

    if (!gradientValue.includes("gradient")) {
      canvas.backgroundColor = gradientValue;
      canvas.renderAll();
      return;
    }

    // Parse the gradient value
    const colors = gradientValue.match(/#[a-fA-F0-9]{6}/g) || [];
    if (colors.length < 2) return;

    // Create fabric.js gradient
    const gradient = new Gradient({
      type: "linear",
      coords: {
        x1: 0,
        y1: 0,
        x2: canvas.width!,
        y2: canvas.height!,
      },
      colorStops: colors.map((color, index) => ({
        offset: index / (colors.length - 1),
        color: color,
      })),
    });

    canvas.backgroundColor = gradient;
    canvas.renderAll();
  };

  return (
    <ScrollArea className="h-96">
      <div className="grid grid-cols-3 gap-2">
        {GRADIENTS.map((gradient, index) => (
          <button
            key={index}
            className="w-full h-16 rounded-lg overflow-hidden hover:ring-2 hover:ring-white/50 transition-all"
            style={{
              background: gradient.value,
              border:
                gradient.value === "transparent" ? "1px dashed #666" : "none",
            }}
            onClick={() => applyGradient(gradient.value)}
            title={gradient.name}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

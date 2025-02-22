
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Canvas } from "fabric";
import { Paintbrush } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BackgroundOptionsProps {
  canvas: Canvas | null;
}

export const BackgroundOptions = ({ canvas }: BackgroundOptionsProps) => {

  const handleBackgroundColorChange = (color: string) => {
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.renderAll();
  };

  const handleRemoveBackground = () => {
    toast({
      title: "Coming soon",
      description: "Background removal will be implemented in the next update",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Paintbrush className="w-5 h-5" />
        <h3 className="text-lg font-medium">Background</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-400">Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              defaultValue="#1a1f2c"
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-12 h-12 p-1 bg-transparent border border-gray-700"
            />
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full bg-transparent border-gray-700 hover:bg-gray-800"
          onClick={handleRemoveBackground}
        >
          Remove Background
        </Button>
      </div>
    </div>
  );
};

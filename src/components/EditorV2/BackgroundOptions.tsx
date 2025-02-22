import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Canvas } from "fabric";
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
      <div className="flex gap-2 pt-4">
        <Label className="text-neutral-400">Color</Label>
        <Input
          type="color"
          defaultValue="#1a1f2c"
          onChange={(e) => handleBackgroundColorChange(e.target.value)}
          className="w-12 h-12 p-1 bg-transparent border border-neutral-700"
        />
      </div>
      <Button
        variant="outline"
        className="w-full bg-transparent border-neutral-700 hover:bg-neutral-800"
        onClick={handleRemoveBackground}
      >
        Remove Background
      </Button>
    </div>
  );
};

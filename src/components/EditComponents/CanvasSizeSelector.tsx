import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ratio } from "lucide-react";

interface CanvasSize {
  name: string;
  width: number;
  height: number;
  category: string;
  description?: string;
}

const canvasSizes: CanvasSize[] = [
  // Auto & Square
  { name: "Auto", width: 800, height: 600, category: "Auto" },
  { name: "1:1 Square", width: 1080, height: 1080, category: "Square" },
  
  // Standard
  { name: "4:3", width: 1600, height: 1200, category: "Standard" },
  { name: "16:9", width: 1920, height: 1080, category: "Widescreen" },
  { name: "3:2", width: 1500, height: 1000, category: "Classic" },
  { name: "5:4", width: 1250, height: 1000, category: "Photo" },
  { name: "1.618:1", width: 1618, height: 1000, category: "Golden" },
  
  // Social Media
  { name: "Instagram Post", width: 1080, height: 1080, category: "Instagram" },
  { name: "Instagram Story", width: 1080, height: 1920, category: "Instagram" },
  { name: "Facebook Post", width: 1200, height: 630, category: "Facebook" },
  { name: "Twitter Post", width: 1200, height: 675, category: "Twitter" },
  { name: "LinkedIn Post", width: 1200, height: 627, category: "LinkedIn" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, category: "YouTube" },
  
  // Custom Sizes
  { name: "Blog Cover", width: 1920, height: 1080, category: "Blog" },
  { name: "Presentation", width: 1920, height: 1080, category: "Presentation" },
];

interface CanvasSizeSelectorProps {
  onSizeSelect: (width: number, height: number) => void;
  currentWidth: number;
  currentHeight: number;
}

export function CanvasSizeSelector({ onSizeSelect, currentWidth, currentHeight }: CanvasSizeSelectorProps) {
  const categories = Array.from(new Set(canvasSizes.map(size => size.category)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Ratio className="h-4 w-4" />
          <span className="sr-only">Change canvas size</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 p-2">
            {categories.map(category => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground px-2">
                  {category}
                </h4>
                <div className="grid gap-1">
                  {canvasSizes
                    .filter(size => size.category === category)
                    .map(size => (
                      <Button
                        key={size.name}
                        variant={currentWidth === size.width && currentHeight === size.height ? "secondary" : "ghost"}
                        className="w-full justify-start font-normal"
                        onClick={() => onSizeSelect(size.width, size.height)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{size.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {size.width}×{size.height}
                          </span>
                        </div>
                      </Button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 
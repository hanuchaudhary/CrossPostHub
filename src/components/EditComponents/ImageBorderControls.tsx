import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ImageBorderControlsProps {
    borderWidth: number;
    borderColor: string;
    borderStyle: string;
    borderRadius: number;
    onBorderWidthChange: (width: number) => void;
    onBorderColorChange: (color: string) => void;
    onBorderStyleChange: (style: string) => void;
    onBorderRadiusChange: (radius: number) => void;
}

const borderStyles = [
    { value: "solid", label: "Solid" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
    { value: "double", label: "Double" },
];

const borderColors = [
    { value: "#000000", label: "Black" },
    { value: "#FFFFFF", label: "White" },
    { value: "#6b7280", label: "Gray" },
    { value: "#ef4444", label: "Red" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#22c55e", label: "Green" },
    { value: "#f59e0b", label: "Yellow" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#ec4899", label: "Pink" },
];

export function ImageBorderControls({
    borderWidth,
    borderColor,
    borderStyle,
    borderRadius,
    onBorderWidthChange,
    onBorderColorChange,
    onBorderStyleChange,
    onBorderRadiusChange,
}: ImageBorderControlsProps) {
    return (
        <div className="space-y-4 p-2">
            <div className="space-y-2">
                <Label>Border Width</Label>
                <Slider
                    value={[borderWidth]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={([value]) => onBorderWidthChange(value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Border Radius</Label>
                <Slider
                    value={[borderRadius]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={([value]) => onBorderRadiusChange(value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Border Style</Label>
                <RadioGroup
                    value={borderStyle}
                    onValueChange={onBorderStyleChange}
                    className="grid grid-cols-2 gap-2"
                >
                    {borderStyles.map((style) => (
                        <div key={style.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={style.value} id={style.value} />
                            <Label htmlFor={style.value}>{style.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label>Border Color</Label>
                <div className="grid grid-cols-3 gap-2">
                    {borderColors.map((color) => (
                        <Button
                            key={color.value}
                            variant="outline"
                            className={cn(
                                "w-full h-8 rounded-md",
                                borderColor === color.value && "ring-2 ring-primary"
                            )}
                            style={{ backgroundColor: color.value }}
                            onClick={() => onBorderColorChange(color.value)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 
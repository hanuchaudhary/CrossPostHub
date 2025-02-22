import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Canvas } from "fabric";
import { LayoutGrid } from "lucide-react";
import { useState } from "react";

interface AspectRatioOption {
    name: string;
    width: number;
    height: number;
    category?: string;
}

const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
    { name: "Auto", width: 1920, height: 1080 },
    { name: "Square (1:1)", width: 1080, height: 1080 },
    { name: "Standard (4:3)", width: 1600, height: 1200 },
    { name: "Golden (1.618:1)", width: 1618, height: 1000 },
    { name: "Widescreen (16:9)", width: 1920, height: 1080 },
    { name: "Classic (3:2)", width: 1500, height: 1000 },
    { name: "Photo (5:4)", width: 1500, height: 1200 },
    { name: "", height:0, width:0, category: "X (Twitter)" },
    { name: "Post (16:9)", width: 1600, height: 900, category: "X (Twitter)" },
    { name: "Header (3:1)", width: 1500, height: 500, category: "X (Twitter)" },
];

interface CanvasAspectRatioOptionsProps {
    canvas: Canvas | null;
}

export const CanvasAspectRatioOptions = ({ canvas }: CanvasAspectRatioOptionsProps) => {
    const [customWidth, setCustomWidth] = useState("1920");
    const [customHeight, setCustomHeight] = useState("1080");

    const resizeCanvas = (width: number, height: number) => {
        if (!canvas) return;

        // Store the current canvas content
        const json = canvas.toJSON();

        // Resize canvas
        canvas.setWidth(width);
        canvas.setHeight(height);

        // Restore content with scaling
        canvas.loadFromJSON(json, () => {
            const scaleX = width / json.width;
            const scaleY = height / json.height;
            const scale = Math.min(scaleX, scaleY);

            canvas.getObjects().forEach((obj) => {
                obj.scale(obj.scaleX! * scale);
                obj.left = obj.left! * scaleX;
                obj.top = obj.top! * scaleY;
            });

            canvas.renderAll();
            canvas.fire('object:modified');
        });
    };

    const handleAspectRatioSelect = (option: AspectRatioOption) => {
        if (!option.width || !option.height) return;
        resizeCanvas(option.width, option.height);
    };

    const handleCustomSize = () => {
        const width = parseInt(customWidth);
        const height = parseInt(customHeight);
        if (width > 0 && height > 0) {
            resizeCanvas(width, height);
        }
    };

    const renderOptions = () => {
        let currentCategory = "";
        return ASPECT_RATIO_OPTIONS.map((option, index) => {
            const element = [];

            if (option.category && option.category !== currentCategory) {
                currentCategory = option.category;
                element.push(
                    <div key={`cat-${index}`} className="mt-4 mb-2 text-sm text-neutral-400">
                        {option.category}
                    </div>
                );
            }

            if (option.width && option.height) {
                element.push(
                    <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start hover:bg-neutral-800"
                        onClick={() => handleAspectRatioSelect(option)}
                    >
                        {option.name}
                    </Button>
                );
            }

            return element;
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-neutral-800">
                    <LayoutGrid className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] bg-[#1A1F2C] border-neutral-800">
                <div className="space-y-4">
                    <div className="flex items-center">
                        <h3 className="font-medium">Canvas Size</h3>
                    </div>

                    <div className="flex gap-2">
                        <div className="space-y-1 flex-1">
                            <label className="text-xs">Width</label>
                            <Input
                                value={customWidth}
                                onChange={(e) => setCustomWidth(e.target.value)}
                                className="bg-neutral-900"
                            />
                        </div>
                        <div className="space-y-1 flex-1">
                            <label className="text-xs">Height</label>
                            <Input
                                value={customHeight}
                                onChange={(e) => setCustomHeight(e.target.value)}
                                className="bg-neutral-900"
                            />
                        </div>
                        <Button
                            className="self-end"
                            variant="secondary"
                            onClick={handleCustomSize}
                        >
                            Set
                        </Button>
                    </div>

                    <div className="space-y-1">
                        {renderOptions()}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}; 
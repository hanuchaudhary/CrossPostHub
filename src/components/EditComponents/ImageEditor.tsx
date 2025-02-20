"use client";

// React imports
import { useRef, useState, useEffect, useCallback } from "react";
import type React from "react";

// Icon imports
import {
    Download,
    Move,
    Maximize,
    Minimize,
    Undo2,
    Redo2,
    Code2,
    Wrench,
    Paintbrush,
    Link,
    RotateCw,
    RotateCcw,
    Ratio,
} from "lucide-react";

// Component imports
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolButton } from "./ToolButtons";
import { PositionGrid } from "./PostionGrid";
import { ControlPopover } from "./ControlPopover";
import UploadImage from "./UploadImage";
import { CanvasSizeSelector } from "./CanvasSizeSelector";

// Utility imports
import { templates } from "@/lib/constants";
import { useUndo } from "@/hooks/use-undo";
import { toast } from "@/hooks/use-toast";
import { backgrounds } from "@/data/BackgroundsData";

// Types
interface Transform {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    skewX: number;
    skewY: number;
}

interface Template {
    id: string;
    name: string;
    icon: React.ReactNode;
    frame: string;
    contentPosition: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

// Utility functions
const createNoisePattern = (
    ctx: CanvasRenderingContext2D,
    color: string,
    opacity: number = 0.07
): CanvasPattern | null => {
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 100;
    noiseCanvas.height = 100;
    const noiseCtx = noiseCanvas.getContext("2d");
    if (!noiseCtx) return null;

    noiseCtx.fillStyle = color;
    noiseCtx.fillRect(0, 0, noiseCanvas.width, noiseCanvas.height);

    const imageData = noiseCtx.createImageData(100, 100);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = Math.random() * opacity * 255;
    }

    noiseCtx.putImageData(imageData, 0, 0);
    return ctx.createPattern(noiseCanvas, "repeat");
};


const getPreviewBackground = (bg: string) => {
    if (bg.startsWith('noise:')) {
        // For noisy solids, just return the base color
        return bg.split(':')[1];
    }
    if (bg.startsWith('noise-gradient')) {
        // For noisy gradients, return the gradient without the noise prefix
        return bg.replace('noise-gradient', 'linear-gradient');
    }
    return bg;
};

export default function ImageEditor() {
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const frameImageRef = useRef<HTMLImageElement | null>(null);
    const rafRef = useRef<number>(0);

    // State
    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
    const [selectedBg, setSelectedBg] = useState<string>(backgrounds[0]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0] as any);
    const [transform, setTransform] = useState<Transform>({
        x: 400,
        y: 300,
        scale: 0.5,
        rotation: 0,
        skewX: 0,
        skewY: 0,
    });
    const [zoom, setZoom] = useState(1);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Hooks
    const {
        state: transformHistory,
        set: setTransformHistory,
        undo,
        redo,
        canUndo,
        canRedo
    } = useUndo<Transform>(transform);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        // Clear canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (selectedBg.startsWith("noise-gradient")) {
            // Handle noisy gradients
            const gradientStr = selectedBg.replace(
                "noise-gradient",
                "linear-gradient"
            );
            const gradient = ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const colors = gradientStr.match(/hsl\([^)]+\)|#[a-f\d]{6}|[a-zA-Z]+/gi);

            if (colors) {
                colors.forEach((color, index) => {
                    gradient.addColorStop(index / (colors.length - 1), color);
                });
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Add noise overlay
                const noisePattern = createNoisePattern(ctx, colors[0]);
                if (noisePattern) {
                    ctx.fillStyle = noisePattern;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
        } else if (selectedBg.startsWith("noise:")) {
            // Handle noisy solid colors
            const baseColor = selectedBg.split(":")[1];
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const noisePattern = createNoisePattern(ctx, baseColor);
            if (noisePattern) {
                ctx.fillStyle = noisePattern;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        } else if (selectedBg.startsWith("linear-gradient")) {
            // Handle regular gradients
            const gradient = ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const colors = selectedBg.match(/hsl\([^)]+\)|#[a-f\d]{6}/gi);
            if (colors) {
                colors.forEach((color, index) => {
                    gradient.addColorStop(index / (colors.length - 1), color);
                });
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        } else if (selectedBg.startsWith("#")) {
            // Handle solid colors
            ctx.fillStyle = selectedBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgImageRef.current) {
            ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
        }

        if (selectedImage) {
            const { contentPosition } = selectedTemplate;

            ctx.save();

            ctx.beginPath();
            ctx.rect(
                contentPosition.x,
                contentPosition.y,
                contentPosition.width,
                contentPosition.height
            );
            ctx.clip();

            ctx.translate(transform.x, transform.y);
            ctx.rotate((transform.rotation * Math.PI) / 180);
            ctx.scale(transform.scale, transform.scale);
            ctx.transform(1, transform.skewY, transform.skewX, 1, 0, 0);

            ctx.drawImage(
                selectedImage,
                -selectedImage.width / 2,
                -selectedImage.height / 2,
                selectedImage.width,
                selectedImage.height
            );

            ctx.restore();
        }

        if (frameImageRef.current && selectedTemplate.frame) {
            ctx.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height);
        }
    }, [selectedImage, selectedBg, transform, selectedTemplate]);

    const draw = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(drawCanvas);
    }, [drawCanvas]);

    const handleCanvasSizeChange = useCallback((width: number, height: number) => {
        if (canvasRef.current) {
            const oldWidth = canvasRef.current.width;
            const oldHeight = canvasRef.current.height;

            // Calculate scale factors
            const scaleX = width / oldWidth;
            const scaleY = height / oldHeight;

            canvasRef.current.width = width;
            canvasRef.current.height = height;
            setCanvasSize({ width, height });

            // Scale the transform proportionally
            setTransform(prev => ({
                ...prev,
                x: prev.x * scaleX,
                y: prev.y * scaleY,
                // Optionally adjust scale to maintain relative size
                scale: prev.scale * Math.min(scaleX, scaleY)
            }));

            draw();
        }
    }, [draw]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = event.target?.result as string;
                img.onload = () => setSelectedImage(img);
            };
            reader.readAsDataURL(file);
        }
    };

    const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.src = url;
        });
    }, []);

    useEffect(() => {
        draw();
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [draw]);

    const exportImage = (
        quality: number = 1.0,
        format: "png" | "jpeg" = "png"
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const link = document.createElement("a");
            link.download = `edited-image-${format}-${quality}.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, quality);
            link.click();
        } catch (error) {
            console.error("Failed to export image:", error);
            toast({
                title: "Failed to export image",
                description: "Please try again later.",
            });
        }
    };

    const handleZoom = (type: 'in' | 'out' | 'reset') => {
        setZoom(prev => {
            switch (type) {
                case 'in': return Math.min(prev + 0.1, 2);
                case 'out': return Math.max(prev - 0.1, 0.1);
                case 'reset': return 1;
                default: return prev;
            }
        });
    };

    const handleRotate = () => {
        setTransform(prev => {
            const newTransform = {
                ...prev,
                rotation: (prev.rotation + 90) % 360
            };
            setTransformHistory(newTransform);
            return newTransform;
        });
    };

    const handleReset = () => {
        const defaultTransform = {
            x: 400,
            y: 300,
            scale: 0.5,
            rotation: 0,
            skewX: 0,
            skewY: 0,
        };
        setTransform(defaultTransform);
        setTransformHistory(defaultTransform);
        setZoom(1);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl max-w-4xl mx-auto">
            {/* Canvas */}
            <div className="h-[250px] sm:h-[600px]">
                <div className="h-full w-full">
                    <canvas
                        width={canvasSize.width}
                        height={canvasSize.height}
                        ref={canvasRef}
                        className="w-full h-full transition-all border border-border shadow-md"
                    />
                </div>
            </div>

            {/* Upload prompt */}
            {!selectedImage && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <UploadImage handleImageUpload={handleImageUpload} />
                </div>
            )}

            {/* Control bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
                <div className="bg-background/80 backdrop-blur-xl border rounded-full px-4 py-2 flex items-center gap-2">
                    {/* Background Selection */}
                    <ControlPopover
                        title="Background"
                        triggerIcon={<Paintbrush className="h-4 w-4" />}
                    >
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Background</h3>
                            <ScrollArea className="h-[300px] w-full rounded-md">
                                <div className="grid grid-cols-3 gap-2 p-2">
                                    {backgrounds.map((bg, index) => (
                                        <div
                                            key={index}
                                            className={`h-16 rounded-md cursor-pointer transition-all hover:scale-105 relative ${selectedBg === bg ? "ring-2 ring-primary ring-offset-2" : ""
                                                }`}
                                            style={{ background: getPreviewBackground(bg) }}
                                            onClick={() => {
                                                setSelectedBg(bg);
                                                draw();
                                            }}
                                        >
                                            {/* Optional: Add indicator for noisy backgrounds */}
                                            {(bg.startsWith('noise:') || bg.startsWith('noise-gradient')) && (
                                                <div className="absolute bottom-1 right-1 w-3 h-3 bg-white/20 rounded-full" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </ControlPopover>

                    {/* Position and Scale */}
                    <ControlPopover
                        title="Position / Scale"
                        triggerIcon={<Move className="h-4 w-4" />}
                    >
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Position / Scale</h3>
                            <PositionGrid
                                value={{ x: transform.x, y: transform.y }}
                                onChange={({ x, y }) =>
                                    setTransform((prev) => ({ ...prev, x, y }))
                                }
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Scale</label>
                                <Slider
                                    value={[transform.scale]}
                                    min={0.0}
                                    max={2}
                                    step={0.01}
                                    onValueChange={([scale]) =>
                                        setTransform((prev) => ({ ...prev, scale }))
                                    }
                                />
                            </div>
                        </div>
                    </ControlPopover>

                    {/* Export Options */}
                    <ControlPopover
                        title="Export"
                        triggerIcon={<Download className="h-4 w-4" />}
                    >
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Export Options</h3>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">PNG Format</h4>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => exportImage(1.0, "png")}
                                >
                                    Maximum Quality PNG
                                </Button>

                                <h4 className="text-sm font-medium text-muted-foreground mt-4">JPEG Format</h4>
                                <div className="grid gap-1">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => exportImage(1.0, "jpeg")}
                                    >
                                        Best Quality JPEG
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => exportImage(0.8, "jpeg")}
                                    >
                                        High Quality JPEG
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => exportImage(0.6, "jpeg")}
                                    >
                                        Medium Quality JPEG
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => exportImage(0.4, "jpeg")}
                                    >
                                        Low Quality JPEG
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ControlPopover>

                    {/* Canvas Size */}

                    <CanvasSizeSelector
                        onSizeSelect={handleCanvasSizeChange}
                        currentWidth={canvasSize.width}
                        currentHeight={canvasSize.height}
                    />

                    {/* Zoom controls */}
                    <ToolButton onClick={() => handleZoom('in')} disabled={zoom >= 2}>
                        <Maximize className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton onClick={() => handleZoom('out')} disabled={zoom <= 0.1}>
                        <Minimize className="h-4 w-4" />
                    </ToolButton>

                    {/* Rotate button */}
                    <ToolButton onClick={handleRotate}>
                        <RotateCw className="h-4 w-4" />
                    </ToolButton>

                    <div className="w-px h-4 bg-border mx-2" />

                    {/* Undo/Redo buttons */}
                    <ToolButton onClick={undo} disabled={!canUndo}>
                        <Undo2 className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton onClick={redo} disabled={!canRedo}>
                        <Redo2 className="h-4 w-4" />
                    </ToolButton>

                    <div className="w-px h-4 bg-border mx-2" />

                    {/* Reset button */}
                    <ToolButton onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                    </ToolButton>

                    <ToolButton>
                        <Code2 className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton>
                        <Wrench className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton>
                        <Link className="h-4 w-4" />
                    </ToolButton>
                </div>
            </div>
        </div >
    );
}

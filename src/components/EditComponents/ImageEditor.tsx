"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import {
    Upload,
    Download,
    Move,
    Maximize,
    Box,
    Monitor,
    Smartphone,
    Twitter,
    Undo2,
    Redo2,
    Code2,
    Wrench,
    Paintbrush,
    Link,
    RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ToolButton } from "@/components/EditComponents/ToolButtons";
import { PositionGrid } from "@/components/EditComponents/PostionGrid";
import type React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ExportImageButton from "./ExportImageButton";
import UploadImage from "./UploadImage";
import { ControlPopover } from "./ControlPopover";

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

const backgrounds = [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
    "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&q=80",
    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))",
    "linear-gradient(to right, hsl(var(--destructive)), hsl(var(--secondary)))",
];

const templates: Template[] = [
    {
        id: "none",
        name: "No Frame",
        icon: <Box className="h-4 w-4" />,
        frame: "",
        contentPosition: { x: 0, y: 0, width: 800, height: 600 },
    },
    {
        id: "iphone",
        name: "iPhone",
        icon: <Smartphone className="h-4 w-4" />,
        frame:
            "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
        contentPosition: { x: 100, y: 80, width: 600, height: 440 },
    },
    {
        id: "macbook",
        name: "MacBook",
        icon: <Monitor className="h-4 w-4" />,
        frame:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80",
        contentPosition: { x: 120, y: 60, width: 560, height: 380 },
    },
    {
        id: "twitter",
        name: "Twitter Post",
        icon: <Twitter className="h-4 w-4" />,
        frame:
            "https://images.unsplash.com/photo-1611162618758-2a29ed739446?w=800&q=80",
        contentPosition: { x: 80, y: 120, width: 640, height: 360 },
    },
];

const presetPositions = [
    { name: "Center", x: 400, y: 300 },
    { name: "Top Left", x: 200, y: 150 },
    { name: "Top Right", x: 600, y: 150 },
    { name: "Bottom Left", x: 200, y: 450 },
    { name: "Bottom Right", x: 600, y: 450 },
];

const presetScales = [
    { name: "100%", scale: 1 },
    { name: "75%", scale: 0.75 },
    { name: "50%", scale: 0.5 },
    { name: "125%", scale: 1.25 },
    { name: "150%", scale: 1.5 },
];

export default function ImageEditor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const frameImageRef = useRef<HTMLImageElement | null>(null);
    const rafRef = useRef<number>(0);

    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
        null
    );
    const [selectedBg, setSelectedBg] = useState<string>(backgrounds[0]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template>(
        templates[0]
    );
    const [transform, setTransform] = useState<Transform>({
        x: 400,
        y: 300,
        scale: 1,
        rotation: 0,
        skewX: 0,
        skewY: 0,
    });

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

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (selectedBg.startsWith("linear-gradient")) {
            const gradient = ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const colors = selectedBg.match(/hsl$$[^)]+$$/g) || [];
            colors.forEach((color, index) => {
                gradient.addColorStop(index / (colors.length - 1), color);
            });
            ctx.fillStyle = gradient;
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

    const requestDraw = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(drawCanvas);
    }, [drawCanvas]);

    useEffect(() => {
        if (!selectedBg.startsWith("linear-gradient")) {
            loadImage(selectedBg).then((img) => {
                bgImageRef.current = img;
                requestDraw();
            });
        } else {
            bgImageRef.current = null;
            requestDraw();
        }

        if (selectedTemplate.frame) {
            loadImage(selectedTemplate.frame).then((img) => {
                frameImageRef.current = img;
                requestDraw();
            });
        } else {
            frameImageRef.current = null;
            requestDraw();
        }

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [selectedBg, selectedTemplate, requestDraw, loadImage]);

    useEffect(() => {
        requestDraw();
    }, [requestDraw]);

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const link = document.createElement("a");
            link.download = "edited-image.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (error) {
            console.error("Failed to download image:", error);
            alert(
                "Unable to download the image. This might happen if you're using external images. Try uploading your own image instead."
            );
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl max-w-4xl mx-auto">
            <div className="h-[250px] sm:h-[600px]">
                <div className="h-full w-full">
                    <canvas
                        width={800}
                        height={600}
                        ref={canvasRef}
                        className="w-full h-full transition-all border border-border shadow-md"
                    />
                </div>
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
                <div className="bg-background/80 backdrop-blur-xl border rounded-full px-4 py-2 flex items-center gap-2">
                    {/* <ToolButton onClick={() => setActiveSheet("position")}>
                        <Move className="h-4 w-4" />
                    </ToolButton> */}
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
                                    min={0.1}
                                    max={2}
                                    step={0.1}
                                    onValueChange={([scale]) =>
                                        setTransform((prev) => ({ ...prev, scale }))
                                    }
                                />
                            </div>
                        </div>
                    </ControlPopover>
                    <ToolButton>
                        <Maximize className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton>
                        <RotateCw className="h-4 w-4" />
                    </ToolButton>
                    <div className="w-px h-4 bg-border mx-2" />
                    <ToolButton>
                        <Undo2 className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton>
                        <Redo2 className="h-4 w-4" />
                    </ToolButton>
                    <div className="w-px h-4 bg-border mx-2" />
                    <ToolButton>
                        <Code2 className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton>
                        <Wrench className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton>
                        <Paintbrush className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton>
                        <Link className="h-4 w-4" />
                    </ToolButton>
                </div>
            </div>
        </div>
    );
}

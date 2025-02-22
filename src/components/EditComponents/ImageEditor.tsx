"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Paintbrush,
  Move,
  Maximize,
  Minimize,
  Undo2,
  Redo2,
  Code2,
  Wrench,
  Link,
  Upload,
} from "lucide-react";
import { BorderOptions } from "@/components/EditorV2/BorderOptions";
import { BackgroundOptions } from "@/components/EditorV2/BackgroundOptions";
import { Canvas } from "fabric";
import * as fabric from "fabric";
import { CanvasAspectRatioOptions } from "@/components/EditorV2/CanvasAspectRatioOptions";
import { BackgroundGradientPicker } from "@/components/EditorV2/BackgroundGradientPicker";
import { toast } from "@/hooks/use-toast";
import { ControlPopover } from "./ControlPopover";
import { PositionGrid } from "./PostionGrid";
import { ToolButton } from "./ToolButtons";

const ImageEditor = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  const [isImagePresent, setIsImagePresent] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const updateDimensions = () => {
      const viewportWidth = window.innerWidth * 0.8;
      const viewportHeight = window.innerHeight * 0.7;
      
      const aspectRatio = 4/3;
      let width = viewportWidth;
      let height = width / aspectRatio;
      
      if (height > viewportHeight) {
        height = viewportHeight;
        width = height * aspectRatio;
      }
      
      return { width, height };
    };

    const dimensions = updateDimensions();
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: "#FFFFFF",
    });

    setCanvas(fabricCanvas);
    setCanvasDimensions(dimensions);

    const handleResize = () => {
      const newDimensions = updateDimensions();
      fabricCanvas.setDimensions(newDimensions);
      setCanvasDimensions(newDimensions);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    canvas.on("object:modified", () => {
      const json = JSON.stringify(canvas.toJSON());
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), json]);
      setHistoryIndex((prev) => prev + 1);
    });
  }, [canvas, historyIndex]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgData = event.target?.result as string;
      const imgElement = new Image();
      imgElement.src = imgData;
      imgElement.onload = () => {
        const image = new fabric.FabricImage(imgElement);

        const scaleFactor = Math.min(
          canvas.width! / image.width!,
          canvas.height! / image.height!
        );

        image.scale(scaleFactor);

        // Center the image on the canvas
        image.set({
          left: (canvas.width! - image.getScaledWidth()) / 2,
          top: (canvas.height! - image.getScaledHeight()) / 2,
          padding: 10,
          cornersize: 10,
        });

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
        setIsImagePresent(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 1,
      quality: 1,
    });

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataURL;
    link.click();

    toast({
      title: "Success!",
      description: "Your image has been downloaded.",
    });
  };

  const handleUndo = () => {
    if (!canvas || historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleRedo = () => {
    if (!canvas || historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleReset = () => {
    if (!canvas) return;
    canvas.clear();
    setIsImagePresent(false);
  };

  const exportImage = (quality: number, format: 'png' | 'jpeg') => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: format,
      quality: quality,
      multiplier: format === 'png' ? 1 : 1, // Always use multiplier 1
    });

    const link = document.createElement("a");
    link.download = `edited-image.${format}`;
    link.href = dataURL;
    link.click();

    toast({
      title: "Success!",
      description: `Your image has been downloaded as ${format.toUpperCase()}.`,
    });
  };

  return (
    <div className="h-screen">
      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex-1 relative flex items-center justify-center bg-primary-foreground rounded-3xl">
          <canvas 
            ref={canvasRef} 
            className="shadow-lg"
            style={{
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
          {!isImagePresent && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <ImageIcon className="w-16 h-16 mx-auto text-neutral-400" />
                <div className="space-y-2">
                  <p className="text-xl font-medium text-neutral-600 dark:text-neutral-300">No image selected</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Upload an image to start editing</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-background/80 backdrop-blur-xl border rounded-full px-4 py-2 flex items-center gap-2">
          {/* Background Selection */}
          <ControlPopover
            toolkitTitle="Background"
            triggerIcon={<Paintbrush className="h-4 w-4" />}
          >
            <BackgroundGradientPicker canvas={canvas} />
            <BackgroundOptions canvas={canvas} />
          </ControlPopover>

          {/* Position and Scale */}
          <ControlPopover
            toolkitTitle="Position / Scale"
            triggerIcon={<Move className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Position / Scale</h3>
              <PositionGrid canvas={canvas} />
            </div>
          </ControlPopover>

          <ControlPopover toolkitTitle="Image Border" title="Image Border">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Position / Scale</h3>
              <BorderOptions canvas={canvas} />
            </div>
          </ControlPopover>

          {/* Canvas Size */}

          <CanvasAspectRatioOptions canvas={canvas} />

          {/* Zoom controls */}
          <ToolButton>
            <Maximize className="h-4 w-4" />
          </ToolButton>
          <ToolButton>
            <Minimize className="h-4 w-4" />
          </ToolButton>

          {/* Rotate button */}
          <ToolButton>
            <RotateCw className="h-4 w-4" />
          </ToolButton>

          <div className="w-px h-4 bg-border mx-2" />

          {/* Undo/Redo buttons */}
          <ToolButton onClick={handleUndo}>
            <Undo2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton onClick={handleRedo}>
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

          {/* <ToolButton> */}
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="bg-transparent border-neutral-700 hover:bg-neutral-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </Button>
          {/* </ToolButton> */}

          <ControlPopover
            toolkitTitle="Export"
            title="Export"
            // triggerIcon={<Download className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Export Options</h3>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  PNG Format
                </h4>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => exportImage(1.0, "png")}
                >
                  Maximum Quality PNG
                </Button>

                <h4 className="text-sm font-medium text-muted-foreground mt-4">
                  JPEG Format
                </h4>
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
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;

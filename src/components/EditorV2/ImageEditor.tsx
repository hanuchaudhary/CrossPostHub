import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Download,
  Image as ImageIcon,
  RotateCcw,
  Frame,
  Layers,
  PenTool,
  Settings,
  RotateCw,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BorderOptions } from "./BorderOptions";
import { BackgroundOptions } from "./BackgroundOptions";
import { Canvas, loadSVGFromURL } from "fabric";
import * as fabric from 'fabric';
import { ResizeOptions } from "./ResizeOptions";
import { PositionScaleOptions } from "./PositionScaleOptions";
import { CanvasAspectRatioOptions } from "./CanvasAspectRatioOptions";
import { BackgroundGradientPicker } from "./BackgroundGradientPicker";

const ImageEditor = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#FFFFFF",
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    canvas.on('object:modified', () => {
      const json = JSON.stringify(canvas.toJSON());
      setHistory(prev => [...prev.slice(0, historyIndex + 1), json]);
      setHistoryIndex(prev => prev + 1);
    });
  }, [canvas, historyIndex]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgData = event.target?.result as string;
      console.log("imgData",);
      console.log("file", file);


      const imgElement = new Image();
      imgElement.src = imgData;
      imgElement.onload = () => {
        const image = new fabric.FabricImage(imgElement);
        console.log("image", image);

        const scaleFactor = Math.min(
          canvas.width! / image.width!,
          canvas.height! / image.height!
        );

        console.log("sacle",scaleFactor);
        

        image.scale(scaleFactor);
        image.set({
          left: (canvas.width! - image.getScaledWidth()) / 2,
          top: (canvas.height! - image.getScaledHeight()) / 2,

        })
        image.set({
          left: (canvas.width) - image.getScaledWidth(),
          top: (canvas.height) - image.getScaledHeight(),
          angle: 0,
          padding: 10,
          cornersize: 10,

        });
        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
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

  const applyBorderToImage = (borderColor: string, borderWidth: number) => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      activeObject.set({
        stroke: borderColor,
        strokeWidth: borderWidth,
      });
      canvas.renderAll();
    }
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
  };

  return (
    <div className="min-h-screen bg-[#221F26] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1A1F2C]/50 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          <span className="text-lg font-semibold">Image Editor</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="bg-transparent border-neutral-700 hover:bg-neutral-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button onClick={handleDownload} className="bg-teal-600 hover:bg-teal-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Tools Sidebar */}
        <div className="w-16 bg-[#1A1F2C] border-r border-neutral-800">
          <div className="flex flex-col items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              className="hover:bg-neutral-800"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              className="hover:bg-neutral-800"
            >
              <RotateCw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="hover:bg-neutral-800"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <PositionScaleOptions canvas={canvas} />
            <CanvasAspectRatioOptions canvas={canvas} />
            <Button variant="ghost" size="icon" className="hover:bg-neutral-800">
              <Frame className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-neutral-800">
              <Layers className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-neutral-800">
              <PenTool className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-neutral-800">
              <Settings className="w-5 h-5" />
            </Button>
            <BackgroundGradientPicker canvas={canvas} />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#1A1F2C] relative">
          <canvas ref={canvasRef} className="absolute inset-0 m-auto" />
          {!canvas && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
              <ImageIcon className="w-16 h-16 mb-4" />
              <p>Upload an image to get started</p>
            </div>
          )}
        </div>

        {/* Control Sidebar */}
        <div className="w-80 bg-[#1A1F2C] border-l border-neutral-800 overflow-y-auto">
          <div className="p-6 space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <ResizeOptions canvas={canvas} />
            <BorderOptions canvas={canvas} />
            <BackgroundOptions canvas={canvas} />
            {/* <BorderOptions canvas={canvas}/> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;

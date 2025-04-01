"use client";

import { useState, useRef, useEffect } from "react";
import Prism from "prismjs";
import { toPng } from "html-to-image";
import {
  Settings2,
  Type,
  PaintBucket,
  Download,
  Monitor,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WindowFrame from "./WindowFrame";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CustomCodeBlock } from "./CodeBlock";
import Image from "next/image";

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "sql", label: "SQL" },
  { value: "markup", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
];

const presetColors = [
  "#ff75c3",
  "#ffa647",
  "#ffe83f",
  "#9fff5b",
  "#70e2ff",
  "#cd93ff",
  "#09203f",
];

const detectLanguage = (code: string): string => {
  // Simple language detection based on common patterns
  if (code.includes("<?php")) return "php";
  if (code.includes("def ") || code.includes("import ")) return "python";
  if (code.includes("func ") || code.includes("package ")) return "go";
  if (code.includes("println!") || code.includes("fn ")) return "rust";
  if (code.includes("public class ") || code.includes("System.out.println"))
    return "java";
  if (code.includes("console.log") || code.includes("=>")) return "javascript";
  if (code.includes("interface ") || code.includes(": string"))
    return "typescript";
  if (code.includes("<jsx>") || code.includes("React.")) return "jsx";
  if (code.includes("SELECT ") || code.includes("FROM ")) return "sql";
  if (code.includes("<html>") || code.includes("<!DOCTYPE")) return "markup";
  if (code.includes("{") && code.includes("}") && code.includes(":"))
    return "json";
  return "jsx"; // default
};


//TODO: ADD svgs of all images and add more also

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1617691819961-77948b5ece7c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
  "https://images.unsplash.com/photo-1499428665502-503f6c608263?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
  "https://images.unsplash.com/photo-1499428665502-503f6c608263?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
  "https://images.unsplash.com/photo-1499428665502-503f6c608263?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdpbmRvd3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D", // Placeholder for demo
];

const MACOS_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFjb3N8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1620120966883-d977b57a96ec?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hY29zfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1620121684840-edffcfc4b878?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG1hY29zfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fG1hY29zfGVufDB8fDB8fHww",
];

const WINDOWS_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1637937267030-6d571ad57f3f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2luZG93cyUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFjb3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWFjb3MlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fG1hY29zJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww",
];

const GRADIENT_BACKGROUNDS = [
  "linear-gradient(to right, #ff758c, #ff7eb3)",
  "linear-gradient(to right, #4facfe, #00f2fe)",
  "linear-gradient(to right, #0ba360, #3cba92)",
  "linear-gradient(to right, #8e2de2, #4a00e0)",
  "linear-gradient(to right, #f43b47, #453a94)",
  "linear-gradient(to right, #0f0c29, #302b63, #24243e)",
  "linear-gradient(to right, #2c3e50, #4ca1af)",
];

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const [background, setBackground] = useState(GRADIENT_BACKGROUNDS[2]);
  const [bgBlur, setBgBlur] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [frameType, setFrameType] = useState<
    "none" | "macos" | "browser" | "window"
  >("none");
  const [frameEnabled, setFrameEnabled] = useState(false);
  const [frameTransparency, setFrameTransparency] = useState(false);
  const [frameColorized, setFrameColorized] = useState(false);
  const [backgroundType, setBackgroundType] = useState<
    "color" | "image" | "gradient"
  >("color");
  const exportRef = useRef<HTMLDivElement>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const detectedLang = detectLanguage(newCode);
    setLanguage(detectedLang);
  };

  const handleExport = async () => {
    if (!exportRef.current) return;

    try {
      const dataUrl = await toPng(exportRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "code-snapshot.png";
      link.href = dataUrl;
      link.click();

      toast({
        title: "Image Exported",
        description: "The code snippet has been exported as an image.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the image.",
      });
      console.error(err);
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundType === "gradient") {
      return { background: background };
    } else if (backgroundType === "image") {
      return {
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    } else {
      return { backgroundColor: background };
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div
        style={getBackgroundStyle()}
        className="flex flex-col p-12 max-w-4xl rounded-2xl relative"
        ref={exportRef}
      >
        <div className="flex items-center justify-center h-full">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-neutral-800 transition-all duration-200 backdrop-blur-sm bg-secondary/80 rounded-xl p-0 shadow-xl">
              <WindowFrame
                type={frameType}
                transparent={frameTransparency}
                colorized={frameColorized}
              >
                {code ? (
                  <div>
                    <CustomCodeBlock
                      code={code}
                      langauge={language}
                      filename="page.tsx"
                      highlightLines={highlightedLines}
                    />
                  </div>
                ) : (
                  <div className="min-h-[300px] flex items-center justify-center text-center p-8">
                    <div className="">
                      <Settings2 className="h-8 w-8 mx-auto mb-4 animate-pulse" />
                      <p className="text-lg font-medium mb-2">
                        No code snippet yet
                      </p>
                      <p className="text-sm">
                        Click the settings icon below to paste your code
                      </p>
                    </div>
                  </div>
                )}
              </WindowFrame>
            </Card>
          </div>
        </div>

        {/* Enhanced Bottom Control Bar */}
        <div className="fixed rounded-full bottom-4 left-1/2 -translate-x-1/2 bg-primary-foreground/90 border border-secondary backdrop-blur-md shadow-2xl">
          <div className="max-w-4xl mx-auto p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  {/* Code Input */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-4">
                            <h4 className="font-medium">Code Input</h4>
                            <div className="space-y-2">
                              <Select
                                value={language}
                                onValueChange={setLanguage}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUPPORTED_LANGUAGES.map((lang) => (
                                    <SelectItem
                                      key={lang.value}
                                      value={lang.value}
                                    >
                                      {lang.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <textarea
                                value={code}
                                onChange={(e) =>
                                  handleCodeChange(e.target.value)
                                }
                                className="w-full h-48 p-4 font-mono text-sm bg-secondary border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Paste your code here..."
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Code Input Settings</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                          >
                            <Type className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div>
                            <h4 className="font-medium">Highlight Lines</h4>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Input
                                  onChange={(e) => {
                                    const lines = e.target.value
                                      .split(",")
                                      .map((line) => parseInt(line.trim()))
                                      .filter((line) => !isNaN(line));
                                    setHighlightedLines(lines);
                                  }}
                                  className="h-8 px-2"
                                  placeholder="e.g. 1, 2, 3"
                                />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Typography Settings</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            style={{
                              backgroundColor:
                                backgroundType === "color"
                                  ? background
                                  : undefined,
                              backgroundImage:
                                backgroundType === "gradient"
                                  ? background
                                  : undefined,
                              border: "2px solid",
                              borderColor:
                                background === "#ffffff"
                                  ? "hsl(var(--border))"
                                  : "transparent",
                            }}
                          >
                            <PaintBucket className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96">
                          <div className="space-y-4 p-2">
                            <h4 className="font-medium leading-none tracking-tight">
                              Background
                            </h4>

                            <Tabs
                              defaultValue="color"
                              onValueChange={(value) =>
                                setBackgroundType(value as any)
                              }
                            >
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="gradient">
                                  Gradient
                                </TabsTrigger>
                                <TabsTrigger value="image">Image</TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value="gradient"
                                className="space-y-4 mt-2"
                              >
                                <div className="space-y-2">
                                  <Label className="text-xs">
                                    Gradient Presets
                                  </Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {GRADIENT_BACKGROUNDS.map((gradient) => (
                                      <button
                                        key={gradient}
                                        className="h-16 rounded-md border border-muted-foreground/20"
                                        style={{ background: gradient }}
                                        onClick={() => {
                                          setBackground(gradient);
                                          setBackgroundType("gradient");
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent
                                value="image"
                                className="space-y-4 mt-2"
                              >
                                <Tabs defaultValue="general">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="general">
                                      General
                                    </TabsTrigger>
                                    <TabsTrigger value="macos">
                                      macOS
                                    </TabsTrigger>
                                    <TabsTrigger value="windows">
                                      Windows
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="general" className="mt-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      {BACKGROUND_IMAGES.map((bg) => (
                                        <button
                                          key={bg}
                                          className="relative h-24 rounded-md overflow-hidden border border-muted-foreground/20"
                                          onClick={() => {
                                            setBackground(bg);
                                            setBackgroundType("image");
                                          }}
                                        >
                                          <Image
                                            src={bg || "/placeholder.svg"}
                                            alt="Background"
                                            fill
                                            className="object-cover"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="macos" className="mt-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      {MACOS_BACKGROUNDS.map((bg) => (
                                        <button
                                          key={bg}
                                          className="relative h-24 rounded-md overflow-hidden border border-muted-foreground/20"
                                          onClick={() => {
                                            setBackground(bg);
                                            setBackgroundType("image");
                                          }}
                                        >
                                          <Image
                                            src={bg || "/placeholder.svg"}
                                            alt="macOS Background"
                                            fill
                                            className="object-cover"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="windows" className="mt-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      {WINDOWS_BACKGROUNDS.map((bg) => (
                                        <button
                                          key={bg}
                                          className="relative h-24 rounded-md overflow-hidden border border-muted-foreground/20"
                                          onClick={() => {
                                            setBackground(bg);
                                            setBackgroundType("image");
                                          }}
                                        >
                                          <Image
                                            src={bg || "/placeholder.svg"}
                                            alt="Windows Background"
                                            fill
                                            className="object-cover"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </TabsContent>
                                </Tabs>

                                <div className="space-y-2">
                                  <Label className="text-xs">Image URL</Label>
                                  <Input
                                    value={
                                      backgroundType === "image"
                                        ? background
                                        : ""
                                    }
                                    onChange={(e) => {
                                      setBackground(e.target.value);
                                      setBackgroundType("image");
                                    }}
                                    className="h-8 px-2"
                                    placeholder="https://example.com/image.jpg"
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">
                                    Background Blur
                                  </Label>
                                  <Switch
                                    id="bg-blur"
                                    checked={bgBlur}
                                    onCheckedChange={setBgBlur}
                                  />
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Background Settings</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                          >
                            <Monitor className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Frame Decoration</h4>
                              <Switch
                                checked={frameEnabled}
                                onCheckedChange={setFrameEnabled}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>

                            {frameEnabled && (
                              <>
                                <div className="space-y-2">
                                  <label className="text-sm text-muted-foreground">
                                    Type
                                  </label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      { label: "macOS", value: "macos" },
                                      { label: "Browser", value: "browser" },
                                      { label: "Window", value: "window" },
                                    ].map((type) => (
                                      <Button
                                        key={type.value}
                                        variant={
                                          frameType === type.value
                                            ? "default"
                                            : "outline"
                                        }
                                        className="w-full"
                                        onClick={() =>
                                          setFrameType(type.value as any)
                                        }
                                      >
                                        {type.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span>Transparency</span>
                                    <Switch
                                      checked={frameTransparency}
                                      onCheckedChange={setFrameTransparency}
                                      className="data-[state=checked]:bg-primary"
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span>Colorized Controls</span>
                                    <Switch
                                      checked={frameColorized}
                                      onCheckedChange={setFrameColorized}
                                      className="data-[state=checked]:bg-primary"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Frame Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Button
                onClick={handleExport}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-full px-4"
                disabled={!code}
              >
                <Download className="h-4 w-4 mr-2" />
                Export as PNG
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

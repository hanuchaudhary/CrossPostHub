"use client";

import { useState, useRef, useEffect } from "react";
import Prism from "prismjs";
import { toPng } from "html-to-image";
import { Settings2, Type, PaintBucket } from "lucide-react";
import { Button } from "@/components/ui/button"; import { Card, } from "@/components/ui/card";
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
import WindowFrame from "./WindowFrame";

// Import Prism themes and languages
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import { toast } from "@/hooks/use-toast";
import { ControlPopover } from "./ControlPopover";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

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

const presetColors = ["#ff75c3", "#ffa647", "#ffe83f", "#9fff5b", "#70e2ff", "#cd93ff", "#09203f"]

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
  return "javascript"; // default
};

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [padding, setPadding] = useState([32]);
  const [fontSize, setFontSize] = useState([14]);
  const [background, setBackground] = useState("#000");
  const [language, setLanguage] = useState("javascript");
  const [wrapCode, setWrapCode] = useState(false);
  const [frameType, setFrameType] = useState<
    "none" | "macos" | "browser" | "window"
  >("none");
  const [frameEnabled, setFrameEnabled] = useState(false);
  const [frameTransparency, setFrameTransparency] = useState(false);
  const [frameColorized, setFrameColorized] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

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

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-secondary/80 rounded-3xl relative">
      {/* Preview Section */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Card
            ref={exportRef}
            className="overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-white/20 transition-all duration-200 backdrop-blur-sm bg-secondary rounded-xl"
          >
            <WindowFrame type={frameType}>
              {code ? (
                <div
                  style={{
                    padding: `${padding}px`,
                    backgroundColor: background,
                    fontSize: `${fontSize}px`,
                  }}
                  className="shadow-inner"
                >
                  <pre className={`!bg-transparent !m-0 !p-0 ${wrapCode ? 'whitespace-pre-wrap' : ''}`}>
                    <code
                      className={`language-${language} !bg-transparent !m-0 !p-0`}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        textWrap: wrapCode ? 'wrap' : 'nowrap'
                      }}
                    >
                      {code}
                    </code>
                  </pre>
                </div>
              ) : (
                <div
                  style={{ backgroundColor: background }}
                  className="min-h-[300px] flex items-center justify-center text-center p-8"
                >
                  <div className="text-zinc-400">
                    <Settings2 className="h-8 w-8 mx-auto mb-4 animate-pulse" />
                    <p className="text-lg font-medium mb-2">No code snippet yet</p>
                    <p className="text-sm">Click the settings icon below to paste your code</p>
                  </div>
                </div>
              )}
            </WindowFrame>
          </Card>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="fixed rounded-full bottom-4 left-1/2 -translate-x-1/2 bg-primary-foreground/80 border-secondary backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                {/* Code Input */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
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
                              onChange={(e) => handleCodeChange(e.target.value)}
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
                        <Button variant="outline" size="icon">
                          <Type className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium">Typography</h4>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Font Size
                            </label>
                            <Slider
                              value={fontSize}
                              onValueChange={setFontSize}
                              min={12}
                              max={20}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Padding
                            </label>
                            <Slider
                              value={padding}
                              onValueChange={setPadding}
                              max={64}
                              step={8}
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium">Wrap Code</label>
                            <input
                              type="checkbox"
                              checked={wrapCode}
                              onChange={(e) => setWrapCode(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Typography Settings</p>
                  </TooltipContent>
                </Tooltip>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      style={{
                        backgroundColor: background,
                        border: "2px solid",
                        borderColor: background === "#ffffff" ? "hsl(var(--border))" : background,
                      }}
                    >
                      <PaintBucket className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4 p-2">
                      <h4 className="font-medium leading-none tracking-tight">Background</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Color Picker</Label>
                            <span className="text-xs text-muted-foreground">{background.toUpperCase()}</span>
                          </div>
                          <div className="border rounded-md my-2 p-2" style={{ backgroundColor: background }}>
                            <Input
                              type="color"
                              value={background}
                              onChange={(e) => setBackground(e.target.value)}
                              className="w-full h-10 cursor-pointer appearance-none bg-transparent border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Presets</Label>
                          <div className="grid grid-cols-7 gap-2">
                            {presetColors.map((color) => (
                              <button
                                key={color}
                                className="h-6 w-6 rounded-md border border-muted bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                style={{ backgroundColor: color }}
                                onClick={() => setBackground(color)}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Hex Value</Label>
                          <Input
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            className="h-8 px-2"
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <ControlPopover toolkitTitle="Frame Decoration" title="Frame">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-zinc-100">Frame Decoration</h4>
                      <Switch
                        checked={frameEnabled}
                        onCheckedChange={setFrameEnabled}
                        className="data-[state=checked]:bg-teal-600"
                      />
                    </div>

                    {frameEnabled && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm text-zinc-400">Type</label>
                          <div className="flex gap-2 p-1 bg-zinc-800 rounded-full">
                            {["macOS", "browser", "Arc"].map((type) => (
                              <button
                                key={type}
                                onClick={() => setFrameType(type.toLowerCase() as "macos" | "browser" | "window")}
                                className={`flex-1 px-4 py-1.5 text-sm rounded-full transition-colors
                                ${frameType === type.toLowerCase()
                                    ? "bg-zinc-900 text-zinc-100"
                                    : "text-zinc-400 hover:text-zinc-300"
                                  }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-100">Transparency</span>
                            <Switch
                              checked={frameTransparency}
                              onCheckedChange={setFrameTransparency}
                              className="data-[state=checked]:bg-teal-600"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-zinc-100">Colorized Window Controls</span>
                            <Switch
                              checked={frameColorized}
                              onCheckedChange={setFrameColorized}
                              className="data-[state=checked]:bg-teal-600"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ControlPopover>

              </TooltipProvider>
            </div>

            <Button
              onClick={handleExport}
              className="bg-black text-white hover:bg-gray-800 transition-colors"
              disabled={!code}
            >
              Export as PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

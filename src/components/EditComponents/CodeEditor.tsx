"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { WindowFrame } from "@/components/EditComponents/WindowFrame";
import {
  CODE_THEMES,
  LOCAL_IMAGES,
  PREDEFINED_GRADIENTS,
  PREDEFINED_IMAGES,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import { useCodeEditorStore } from "@/store/EditStore/useEditStore";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CodeBlock } from "./CodeBlock";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Collapsible } from "../ui/custom-collapsible";
import { ScrollArea } from "../ui/scroll-area";
import html2canvas from "html2canvas";
import { customToast } from "../CreatePost/customToast";
import { Slider } from "../ui/slider";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeEditor: React.FC = () => {
  const {
    highlightedCodeLines,
    setHighlightedCodeLines,
    setCode,
    language,
    setLanguage,
    fileName,
    setFileName,
    code,
    codeBackgroundColor,
    setCodeBackgroundColor,
    windowFrame,
    setWindowFrame,
    background,
    setBackground,
    border,
    setBorder,
    theme,
    setTheme,
  } = useCodeEditorStore();

  const exportRef = useRef<HTMLDivElement>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  // const [currentOpenDropdown, setCurrentOpenDropdown] = useState([{}]);

  // Compute background style for the outer frame
  const getBackgroundStyle = useMemo(() => {
    switch (background.type) {
      case "solid":
        return {
          backgroundColor: background.solid,
          borderRadius: "16px",
          padding: "24px",
        };
      case "gradient":
        return {
          backgroundImage: background.gradient,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "16px",
          padding: "24px",
        };
      case "image":
        return {
          backgroundImage: `url(${background.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "16px",
          padding: "24px",
        };
      default:
        return {
          backgroundColor: "transparent",
          borderRadius: "16px",
          padding: "24px",
        };
    }
  }, [background]);

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 3, // High resolution for Retina displays
        backgroundColor: null, // Preserve background (gradient/image)
        useCORS: true, // Handle CDN images
        logging: false, // Disable debug logs
        // letterRendering: true, // Sharper text
        // dpi: window.devicePixelRatio * 96, // Match device DPI
        width: exportRef.current.offsetWidth, // Exact dimensions
        height: exportRef.current.offsetHeight,
      });

      // Convert canvas to PNG and trigger download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fileName || "code"}.png`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      customToast({
        title: "Export Failed",
        description: "An error occurred while exporting the image.",
      });
    }
  }, [fileName]);

  useEffect(() => {
    if (windowFrame.type !== "none") {
      setBorder({
        radius: 0,
        width: 0,
      });
    }
  }, [windowFrame.type, setBorder]);

  return (
    <div className="flex md:flex-row flex-col gap-2 min-h-[70vh]">
      {/* Code Editor Section */}
      <div className="w-full bg-secondary/30 rounded-2xl p-[10px] border border-border flex flex-col gap-6">
        <div className="space-y-2">
          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="min-h-80 resize-none rounded-[12px] border border-border bg-secondary/40 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
            placeholder="Paste your code here..."
            style={{
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          <Collapsible trigger="Code Settings" open={true} buttonClassName="w-full">
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <Label className="text-sm">Code Background Color</Label>
                    <div className="relative mt-2">
                      <span
                        className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                        style={{ backgroundColor: codeBackgroundColor }}
                      ></span>
                      <Input
                        value={codeBackgroundColor}
                        onChange={(e) => setCodeBackgroundColor(e.target.value)}
                        placeholder="Code Background Color"
                        className="rounded-[12px] border border-border bg-secondary/40 p-4 pl-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
                      />
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <HexColorPicker
                    color={codeBackgroundColor}
                    onChange={(color) => {
                      setCodeBackgroundColor(color);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File Name</Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="rounded-[12px] border border-border bg-secondary/40 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
              />
            </div>

            <div className="space-y-2">
              <Label>Highlight Lines</Label>
              <Input
                onChange={(e) => {
                  const lines = e.target.value
                    .split(",")
                    .map(Number)
                    .filter(Boolean);
                  setHighlightedCodeLines(lines);
                }}
                type="text"
                placeholder="Enter line numbers separated by commas"
                className="rounded-[12px] border border-border bg-secondary/40 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
              />
            </div>
          </Collapsible>
          <Collapsible trigger="Themes" buttonClassName="w-full">
            <ScrollArea className="h-64">
              {CODE_THEMES.map((theme) => (
                <button
                  onClick={() => setTheme(theme.value)}
                  className="custor-pointer select-none"
                  key={theme.label}
                >
                  <SyntaxHighlighter
                    language={"javascript"}
                    style={theme.value}
                    wrapLines={true}
                    showLineNumbers={true}
                    PreTag="div"
                    customStyle={{
                      fontSize: "0.75rem",
                    }}
                  >
                    {`console.log("CrosspostHub")`}
                  </SyntaxHighlighter>
                </button>
              ))}
            </ScrollArea>
          </Collapsible>
        </div>
      </div>

      {/* Code Preview Section */}
      <div className="bg-secondary/30 rounded-2xl border">
        <div
          ref={exportRef}
          style={{
            ...getBackgroundStyle,
            backdropFilter: `blur(10px)`, // Apply blur
            WebkitBackdropFilter: `blur(${background.blur}px)`, // For Safari support
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <Card className="border-none bg-transparent shadow-none transition-all duration-200 p-0 w-full">
            <WindowFrame
              title={fileName}
              type={windowFrame.type}
              transparent={windowFrame.transparent}
              colorized={windowFrame.colorized}
            >
              <CodeBlock
                theme={theme}
                border={border}
                backgroundColor={codeBackgroundColor}
                code={code}
                language={language}
                filename={fileName}
                highlightLines={highlightedCodeLines}
              />
            </WindowFrame>
          </Card>
        </div>
      </div>

      {/* Window Frame and Background Settings */}
      <div className="bg-secondary/30 rounded-2xl border w-full p-2 space-y-2">
        <div className="flex space-x-2">
          <Collapsible open={true} trigger="Select Frame">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "None", value: "none" },
                  { label: "Mac", value: "macos" },
                  { label: "Browser", value: "browser" },
                  { label: "Window", value: "window" },
                  { label: "Arc", value: "arc" },
                ].map((type) => (
                  <Button
                    key={type.value}
                    variant={
                      windowFrame.type === type.value ? "default" : "secondary"
                    }
                    className="w-full"
                    onClick={() => {
                      setWindowFrame({
                        ...windowFrame,
                        type: type.value as "macos" | "browser" | "window",
                      });
                    }}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between">
                  <Label>Transparency</Label>
                  <Switch
                    checked={windowFrame.transparent}
                    onCheckedChange={(checked) =>
                      setWindowFrame({
                        ...windowFrame,
                        transparent: checked,
                      })
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Colorized Controls</Label>
                  <Switch
                    checked={windowFrame.colorized}
                    onCheckedChange={(checked) =>
                      setWindowFrame({
                        ...windowFrame,
                        colorized: checked,
                      })
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          </Collapsible>
        </div>
        <div>
          <Collapsible trigger="Background" buttonClassName="w-full">
            <ul className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "None", value: "none" },
                { label: "Solid", value: "solid" },
                { label: "Gradient", value: "gradient" },
                { label: "Image", value: "image" },
              ].map((bg) => (
                <li
                  onClick={() =>
                    setBackground({
                      ...background,
                      type: bg.value as "none" | "image" | "gradient" | "solid",
                    })
                  }
                  className="text-center flex items-center justify-center cursor-pointer"
                  key={bg.value}
                >
                  <div>
                    <div
                      style={{
                        backgroundColor:
                          bg.value === "solid" ? background.solid : "",
                        backgroundImage:
                          bg.value === "gradient"
                            ? background.gradient
                            : bg.value === "image"
                              ? `url(${background.image})`
                              : "",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      className="border h-10 w-10 rounded-full"
                    ></div>
                    <Label>{bg.label}</Label>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              {background.type === "solid" && (
                <div className="space-y-2">
                  <Label>Solid Color</Label>
                  <HexColorPicker
                    color={background.solid}
                    onChange={(color) =>
                      setBackground({
                        ...background,
                        solid: color,
                      })
                    }
                  />
                </div>
              )}

              {background.type !== "none" && background.type !== "solid" && (
                <div className="space-y-2">
                  <Slider
                    // label={`Background Blur (${background.blur}px)`}
                    label="Blur"
                    min={2}
                    max={20}
                    step={1}
                    value={[background.blur]}
                    onValueChange={([value]) =>
                      setBackground({ ...background, blur: value })
                    }
                  />
                </div>
              )}
              {background.type === "gradient" && (
                <div className="space-y-4">
                  <ScrollArea className="h-56">
                    <div className="grid grid-cols-3 gap-2">
                      {PREDEFINED_GRADIENTS.map((grad) => (
                        <div
                          key={grad.id}
                          className="h-10 rounded cursor-pointer border"
                          style={{ backgroundImage: grad.value }}
                          onClick={() =>
                            setBackground({
                              ...background,
                              gradient: grad.value,
                            })
                          }
                          title={grad.label}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {background.type === "image" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {LOCAL_IMAGES.map((img) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.id}
                        className="h-10 w-full object-cover rounded cursor-pointer border"
                        loading="lazy"
                        onClick={() =>
                          setBackground({
                            ...background,
                            image: img.url,
                          })
                        }
                      />
                    ))}
                  </div>
                  <div className="border-dashed border-2 p-4 rounded-lg text-center cursor-pointer">
                    <p>Drag & drop an image or click to upload</p>
                  </div>
                </div>
              )}
            </div>
          </Collapsible>
        </div>
        <div>
          <Collapsible trigger="Border">
            <div className="space-y-2">
              <Collapsible trigger="Border Type">
                <div className="space-y-1">
                  {["none", "solid", "dashed", "dotted"].map((e) => (
                    <Button
                      key={e}
                      variant={border.type === e ? "default" : "secondary"}
                      className="w-full"
                      onClick={() => {
                        setBorder({
                          ...border,
                          type: e as "none" | "solid" | "dashed" | "dotted",
                        });
                      }}
                    >
                      {e.charAt(0).toUpperCase() + e.slice(1)}
                    </Button>
                  ))}
                </div>
              </Collapsible>
              <Slider
                label={`Border width (${border.width}px)`}
                min={0}
                max={6}
                step={0.1}
                value={[border.width]}
                onValueChange={([value]) =>
                  setBorder({ ...border, width: value })
                }
              />
              <Slider
                label={`Border Radius (${border.radius}px)`}
                min={0}
                max={30}
                step={0.5}
                value={[border.radius]}
                onValueChange={([value]) =>
                  setBorder({ ...border, radius: value })
                }
              />
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <div>
                      <Label className="text-sm">Border Color</Label>
                      <div className="relative mt-2">
                        <span
                          className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                          style={{ backgroundColor: border.color }}
                        ></span>
                        <Input
                          value={border.color}
                          onChange={(e) =>
                            setBorder({
                              ...border,
                              color: e.target.value,
                            })
                          }
                          placeholder="Border color"
                          className="rounded-[12px] border border-border bg-secondary/40 p-4 pl-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
                        />
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <HexColorPicker
                      color={border.color}
                      onChange={(color) => {
                        setBorder({
                          ...border,
                          color,
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </Collapsible>
        </div>
        <div className="space-y-2">
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              setHighlightedCodeLines([]);
              setBackground({
                type: "none",
                image: "",
                gradient: "linear-gradient(0deg, #1a1a3d, #4a4a8d)",
                solid: "#ffffff",
                blur: 0,
              });
              setBorder({
                type: "solid",
                color: "#333333",
                width: 1,
                radius: 15,
              });
              setWindowFrame({
                type: "none",
                transparent: false,
                colorized: false,
              });
              setTheme(atomDark);
            }}
          >
            Reset
          </Button>
        </div>
        <div className="space-y-2">
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

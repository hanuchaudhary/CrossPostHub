"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
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
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { WindowFrame } from "@/components/EditComponents/WindowFrame";
import {
  CODE_THEMES,
  LOCAL_IMAGES,
  PREDEFINED_GRADIENTS,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import { useCodeEditorStore } from "@/store/MainStore/useCodeEditStore";
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
import { useSession } from "next-auth/react";
import {
  IconCircleArrowDownFilled,
  IconFileDownloadFilled,
  IconLoader,
  IconLockFilled,
  IconReload,
  IconSend,
} from "@tabler/icons-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BorderStyle } from "@/Types/Types";
import { parseRgba } from "@/lib/parseRGBA";

const ThemePreview = React.memo(
  ({ theme, onClick }: { theme: any; onClick: () => void }) => (
    <button onClick={onClick} className="cursor-pointer select-none">
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
  )
);
ThemePreview.displayName = "ThemePreview";

const CodeEditor: React.FC = () => {
  const { data } = useSession();
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
  const [downloading, setDownloading] = useState<boolean>(false);
  const router = useRouter();
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([
    "Code Settings",
    "Select Frame",
  ]);

  // Handler to manage Collapsible open/close
  const handleCollapsibleToggle = (trigger: string, isOpen: boolean) => {
    setOpenCollapsibles((prev) => {
      if (isOpen) {
        // Opening a Collapsible
        const newOpen = [...prev, trigger];
        // If more than 2 are open, close the oldest (first in array)
        if (newOpen.length > 2) {
          return newOpen.slice(1); // Keep the last two
        }
        return newOpen;
      } else {
        // Closing a Collapsible
        return prev.filter((item) => item !== trigger);
      }
    });
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

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

  // Function to capture the image of the code block
  const captureImage = useCallback(async (): Promise<string | null> => {
    if (!exportRef.current) return null;
    setOpenCollapsibles([]); // Close all collapsibles before capturing
    setDownloading(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        width: exportRef.current.offsetWidth,
        height: exportRef.current.offsetHeight,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Image capture failed:", error);
      customToast({
        title: "Capture Failed",
        description: "An error occurred while capturing the image.",
      });
      return null;
    } finally {
      setDownloading(false);
    }
  }, []);

  // Function to handle export button click
  const handleExport = useCallback(async () => {
    const imageData = await captureImage();
    if (imageData) {
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `${fileName || "code"}.png`;
      link.click();
    }
  }, [fileName, captureImage]);

  // Function to handle share with CrosspostHub button click
  const handleShareWithCrosspostHub = useCallback(async () => {
    // Check if the user is logged in
    if (!data?.user) {
      toast({
        title: "Please login to continue",
        description: "You need to login to continue.",
        action: (
          <Link href="/signin">
            <Button variant={"default"} size={"sm"}>
              Login
            </Button>
          </Link>
        ),
      });
      return;
    }

    const imageData = await captureImage();
    if (imageData) {
      // Store the image in sessionStorage
      sessionStorage.setItem("codeEditorImage", imageData);
      // Redirect to /create route with query parameter from=code-editor
      router.push("/create?from=code-editor");
    }
  }, [captureImage]);

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
            className="md:min-h-80 min-h-52 md:text-sm text-xs resize-none rounded-[12px] border border-border bg-secondary/40 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
            placeholder="Paste your code here..."
            style={{
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          <Collapsible
            trigger="Code Settings"
            open={openCollapsibles.includes("Code Settings")}
            onOpenChange={(isOpen) =>
              handleCollapsibleToggle("Code Settings", isOpen)
            }
            buttonClassName="w-full"
          >
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

          <Collapsible
            trigger="Themes"
            open={openCollapsibles.includes("Themes")}
            onOpenChange={(isOpen) => handleCollapsibleToggle("Themes", isOpen)}
            buttonClassName="w-full"
          >
            <ScrollArea className="h-64">
              {CODE_THEMES.map((theme) => (
                <ThemePreview
                  key={theme.label}
                  theme={theme}
                  onClick={() => setTheme(theme.value)}
                />
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
            backdropFilter: `blur(${background.blur}px)`, // Fixed blur application
            WebkitBackdropFilter: `blur(${background.blur}px)`,
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <Card className="border-none bg-transparent shadow-none transition-all duration-200 p-0 w-full">
            <WindowFrame
              border={windowFrame.frameBorder}
              username={data?.user?.name?.toLowerCase().replace(" ", "")}
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
      <div className="bg-secondary/30 rounded-2xl border w-full p-2 flex flex-col gap-2 justify-between">
        <div className="space-y-2">
          <Collapsible
            trigger="Select Frame"
            open={openCollapsibles.includes("Select Frame")}
            onOpenChange={(isOpen) =>
              handleCollapsibleToggle("Select Frame", isOpen)
            }
          >
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
              <div className="space-y-2">
                <Collapsible
                  trigger="Frame Border"
                  open={openCollapsibles.includes("Window Frame Border")}
                  onOpenChange={(isOpen) =>
                    handleCollapsibleToggle("Window Frame Border", isOpen)
                  }
                  // className="space-y-2"
                >
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Border Style</Label>
                      <div className="flex flex-wrap items-center gap-2 justify-center">
                        {["none", "solid", "dashed", "dotted", "double"].map(
                          (e) => (
                            <div
                              key={e}
                              onClick={() => {
                                setWindowFrame({
                                  ...windowFrame,
                                  frameBorder: {
                                    ...windowFrame.frameBorder,
                                    type: e as BorderStyle,
                                  },
                                });
                              }}
                              className={cn(
                                "w-10 h-8 rounded flex items-center justify-center cursor-pointer border border-border",
                                border.type === e && "bg-primary/30",
                                e === "solid" && "border-2 border-neutral-400",
                                e === "double" &&
                                  "border-4 border-double border-neutral-400",
                                e === "dashed" &&
                                  "border-2 border-dashed border-neutral-400",
                                e === "dotted" &&
                                  "border-2 border-dotted border-neutral-400"
                              )}
                            />
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Slider
                        label={`Border width (${windowFrame.frameBorder.width}px)`}
                        min={0}
                        max={6}
                        step={0.1}
                        value={[windowFrame.frameBorder.width]}
                        onValueChange={([value]) =>
                          setWindowFrame({
                            ...windowFrame,
                            frameBorder: {
                              ...windowFrame.frameBorder,
                              width: value,
                            },
                          })
                        }
                      />
                      <Slider
                        label={`Border Radius (${windowFrame.frameBorder.radius}px)`}
                        min={0}
                        max={30}
                        step={0.5}
                        value={[windowFrame.frameBorder.radius]}
                        onValueChange={([value]) =>
                          setWindowFrame({
                            ...windowFrame,
                            frameBorder: {
                              ...windowFrame.frameBorder,
                              radius: value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div>
                            <Label className="text-sm">Border Color</Label>
                            <div className="relative mt-2">
                              <span
                                className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                style={{
                                  backgroundColor:
                                    windowFrame.frameBorder.color,
                                }}
                              ></span>
                              <Input
                                value={windowFrame.frameBorder.color}
                                onChange={(e) =>
                                  setWindowFrame({
                                    ...windowFrame,
                                    frameBorder: {
                                      ...windowFrame.frameBorder,
                                      color: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Border color"
                                className="rounded-[12px] border border-border bg-secondary/40 p-4 pl-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
                              />
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                          <RgbaColorPicker
                            color={parseRgba(windowFrame.frameBorder.color)}
                            onChange={(rgba) => {
                              setWindowFrame({
                                ...windowFrame,
                                frameBorder: {
                                  ...windowFrame.frameBorder,
                                  color: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
                                },
                              });
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </Collapsible>
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

          <Collapsible
            trigger="Background"
            open={openCollapsibles.includes("Background")}
            onOpenChange={(isOpen) =>
              handleCollapsibleToggle("Background", isOpen)
            }
            buttonClassName="w-full"
          >
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
                      <Image
                        width={100}
                        height={100}
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

          <Collapsible
            trigger="Border"
            open={openCollapsibles.includes("Border")}
            onOpenChange={(isOpen) => handleCollapsibleToggle("Border", isOpen)}
            // className="space-y-2"
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Border Style</Label>
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  {["none", "solid", "dashed", "dotted", "double"].map((e) => (
                    <div
                      key={e}
                      onClick={() => {
                        setBorder({
                          ...border,
                          type: e as BorderStyle,
                        });
                      }}
                      className={cn(
                        "w-10 h-8 rounded flex items-center justify-center cursor-pointer border border-border",
                        border.type === e && "bg-primary/30",
                        e === "solid" && "border-2 border-neutral-400",
                        e === "double" &&
                          "border-4 border-double border-neutral-400",
                        e === "dashed" &&
                          "border-2 border-dashed border-neutral-400",
                        e === "dotted" &&
                          "border-2 border-dotted border-neutral-400"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
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
              </div>
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
                    <RgbaColorPicker
                      color={parseRgba(border.color)}
                      onChange={(rgba) => {
                        setBorder({
                          ...border,
                          color: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </Collapsible>
        </div>

        <div className="border rounded-2xl p-2 space-y-2 bg-secondary/50">
          <div className="flex items-center gap-1.5">
            <Button
              className="flex items-center justify-center gap-2 px-3"
              size={"icon"}
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
              <IconReload />
            </Button>
            <Button
              className="flex w-full items-center justify-center gap-2"
              onClick={() => {
                setBackground({
                  type: "image",
                  image: "/wallpaper/w1.jpg",
                });
                setWindowFrame({
                  type: "arc",
                  colorized: true,
                  frameBorder: {
                    type: "solid",
                    color: "#333333",
                    radius: 20,
                    width: 1,
                  },
                });
                setFileName("example-code.tsx");
                setOpenCollapsibles([]);
              }}
            >
              Quick Edit
            </Button>
          </div>
          <Button
            className="w-full"
            onClick={handleExport}
            disabled={downloading}
          >
            {!downloading ? (
              <div className="flex items-center justify-center gap-1">
                <IconCircleArrowDownFilled className="h-5 w-5" />
                Download
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <IconLoader className="h-5 w-5 animate-spin" />
                Downloading
              </div>
            )}
          </Button>
        </div>
      </div>
      <div className="md:flex hidden fixed top-3 right-3 border rounded-2xl p-1 gap-2 bg-secondary/50">
        <Button
          size={"sm"}
          className="w-full flex items-center justify-center gap-1"
          onClick={() => {
            useCodeEditorStore.getState().saveDraft();
            toast({
              title: "Draft Saved",
            });
          }}
        >
          <IconFileDownloadFilled /> Save as Draft
        </Button>

        <Button
          size={"sm"}
          variant={"secondary"}
          className="w-full flex items-center justify-center gap-2"
          onClick={() => {
            useCodeEditorStore.getState().loadDraft();
            toast({
              title: "Your saved draft has been loaded.",
            });
          }}
        >
          Load Draft
        </Button>

        <Button
          size={"sm"}
          className="w-full"
          onClick={handleShareWithCrosspostHub}
        >
          {!data?.user.name ? (
            <span className=" flex items-center justify-center gap-1">
              Share <IconLockFilled />
            </span>
          ) : (
            <span className=" flex items-center justify-center gap-1">
              Share <IconSend />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CodeEditor;

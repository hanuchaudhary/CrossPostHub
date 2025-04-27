"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CodeBlock } from "./CodeBlock";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Collapsible } from "@/components/ui/custom-collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import html2canvas from "html2canvas";
import { customToast } from "../../CreatePost/customToast";
import { Slider } from "@/components/ui/slider";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSession } from "next-auth/react";
import {
  IconFileDownloadFilled,
  IconLockFilled,
  IconSend,
} from "@tabler/icons-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BorderStyle } from "@/Types/Types";
import { parseRgba } from "@/lib/parseRGBA";
import {
  GetBackgroundStyle,
  useCaptureImage,
  useCollapsibleManager,
} from "../EditTools";
import BottomToolbar from "../BottomToolbar";
import UpperToolbar from "../UpperToolbar";

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
  const router = useRouter();
  const store = useCodeEditorStore();
  const exportRef = React.useRef<HTMLDivElement>(null);
  const { handleCollapsibleToggle, openCollapsibles } = useCollapsibleManager();

  const handleCodeChange = (newCode: string) => {
    store.setCode(newCode);
  };

  const { captureImage, downloading } = useCaptureImage(exportRef);
  const handleExport = React.useCallback(async () => {
    const imageData = await captureImage();
    if (imageData) {
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `${store.fileName || "code"}.png`;
      link.click();
    }
  }, [store.fileName, captureImage]);

  // Function to handle share with CrosspostHub button click
  const handleShareWithCrosspostHub = React.useCallback(async () => {
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
      sessionStorage.setItem("editorImage", imageData);
      router.push("/create?from=editor");
    }
  }, [captureImage]);

  React.useEffect(() => {
    if (store.windowFrame.type !== "none") {
      store.setBorder({
        radius: 0,
        width: 0,
      });
    }
  }, [store.windowFrame.type, store.setBorder]);

  const handleQuickEdit = React.useCallback(() => {
    store.setBackground({
      type: "image",
      image: "/wallpaper/w2.jpg",
    });

    store.setWindowFrame({
      type: "arc",
      colorized: true,
      frameBorder: {
        type: "solid",
        color: "#333333",
        radius: 20,
        width: 2,
      },
    });
    store.setFileName("code.tsx");
    store.setCodeBackgroundColor("rgba(3, 3, 3, 0.8)");
  }, []);

  const handleReset = React.useCallback(() => {
    store.setHighlightedCodeLines([]);
    store.setBackground({
      type: "none",
      image: "",
      gradient: "linear-gradient(0deg, #1a1a3d, #4a4a8d)",
      solid: "#ffffff",
      blur: 0,
    });
    store.setBorder({
      type: "solid",
      color: "#333333",
      width: 1,
      radius: 15,
    });
    store.setWindowFrame({
      type: "none",
      transparent: false,
      colorized: false,
    });
    store.setCodeBackgroundColor("");
    store.setTheme(atomDark);
  }, []);

  return (
    <div className="flex md:flex-row flex-col gap-2 min-h-[70vh]">
      {/* Code Editor Section */}
      <div className="scroll-custom md:h-[calc(100vh-70px)] overflow-y-auto w-full bg-secondary/30 rounded-2xl p-[10px] border border-border flex flex-col gap-6">
        <div className="space-y-2">
          <Textarea
            value={store.code}
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
                        style={{ backgroundColor: store.codeBackgroundColor }}
                      ></span>
                      <Input
                        value={store.codeBackgroundColor}
                        onChange={(e) =>
                          store.setCodeBackgroundColor(e.target.value)
                        }
                        placeholder="Code Background Color"
                        className="rounded-[12px] border border-border bg-secondary/40 p-4 pl-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
                      />
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <RgbaColorPicker
                    color={parseRgba(store.codeBackgroundColor)}
                    onChange={(color) => {
                      store.setCodeBackgroundColor(
                        `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={store.language} onValueChange={store.setLanguage}>
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
                value={store.fileName}
                onChange={(e) => store.setFileName(e.target.value)}
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
                  store.setHighlightedCodeLines(lines);
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
                  onClick={() => store.setTheme(theme.value)}
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
            ...GetBackgroundStyle(store),
            backdropFilter: `blur(${store.background.blur}px)`, // Fixed blur application
            WebkitBackdropFilter: `blur(${store.background.blur}px)`,
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <Card className="border-none bg-transparent shadow-none transition-all duration-200 p-0 w-full">
            <WindowFrame
              shadow={store.windowFrame.shadow}
              border={store.windowFrame.frameBorder}
              username={data?.user?.name?.toLowerCase().replace(" ", "")}
              title={store.fileName}
              type={store.windowFrame.type}
              transparent={store.windowFrame.transparent}
              colorized={store.windowFrame.colorized}
            >
              <CodeBlock
                theme={store.theme}
                border={store.border}
                backgroundColor={store.codeBackgroundColor}
                code={store.code}
                language={store.language}
                filename={store.fileName}
                highlightLines={store.highlightedCodeLines}
              />
            </WindowFrame>
          </Card>
        </div>
      </div>

      {/* Window Frame and Background Settings */}
      <div className="scroll-custom bg-secondary/30 md:h-[calc(100vh-70px)] overflow-y-auto rounded-2xl border w-full p-2 flex flex-col gap-2 justify-between">
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
                      store.windowFrame.type === type.value
                        ? "default"
                        : "secondary"
                    }
                    className="w-full"
                    onClick={() => {
                      store.setWindowFrame({
                        ...store.windowFrame,
                        type: type.value as "macos" | "browser" | "window",
                      });
                    }}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              {store.windowFrame.type !== "none" && (
                <div className="space-y-2">
                  <Separator />
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Border Style</Label>
                      <div className="flex flex-wrap items-center gap-2 justify-center">
                        {["none", "solid", "dashed", "dotted", "double"].map(
                          (e) => (
                            <div
                              key={e}
                              onClick={() => {
                                store.setWindowFrame({
                                  ...store.windowFrame,
                                  frameBorder: {
                                    ...store.windowFrame.frameBorder,
                                    type: e as BorderStyle,
                                  },
                                });
                              }}
                              className={cn(
                                "w-10 h-8 rounded flex items-center justify-center cursor-pointer border border-border",
                                store.border.type === e && "bg-primary/30",
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
                        label={`Border width (${store.windowFrame.frameBorder.width}px)`}
                        min={0}
                        max={6}
                        step={0.1}
                        value={[store.windowFrame.frameBorder.width]}
                        onValueChange={([value]) =>
                          store.setWindowFrame({
                            ...store.windowFrame,
                            frameBorder: {
                              ...store.windowFrame.frameBorder,
                              width: value,
                            },
                          })
                        }
                      />
                      <Slider
                        label={`Border Radius (${store.windowFrame.frameBorder.radius}px)`}
                        min={0}
                        max={30}
                        step={0.5}
                        value={[store.windowFrame.frameBorder.radius]}
                        onValueChange={([value]) =>
                          store.setWindowFrame({
                            ...store.windowFrame,
                            frameBorder: {
                              ...store.windowFrame.frameBorder,
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
                                    store.windowFrame.frameBorder.color,
                                }}
                              ></span>
                              <Input
                                value={store.windowFrame.frameBorder.color}
                                onChange={(e) =>
                                  store.setWindowFrame({
                                    ...store.windowFrame,
                                    frameBorder: {
                                      ...store.windowFrame.frameBorder,
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
                            color={parseRgba(
                              store.windowFrame.frameBorder.color
                            )}
                            onChange={(rgba) => {
                              store.setWindowFrame({
                                ...store.windowFrame,
                                frameBorder: {
                                  ...store.windowFrame.frameBorder,
                                  color: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
                                },
                              });
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Transparency</Label>
                    <Switch
                      checked={store.windowFrame.transparent}
                      onCheckedChange={(checked) =>
                        store.setWindowFrame({
                          ...store.windowFrame,
                          transparent: checked,
                        })
                      }
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Colorized Controls</Label>
                    <Switch
                      checked={store.windowFrame.colorized}
                      onCheckedChange={(checked) =>
                        store.setWindowFrame({
                          ...store.windowFrame,
                          colorized: checked,
                        })
                      }
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              )}
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
                    store.setBackground({
                      ...store.background,
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
                          bg.value === "solid" ? store.background.solid : "",
                        backgroundImage:
                          bg.value === "gradient"
                            ? store.background.gradient
                            : bg.value === "image"
                              ? `url(${store.background.image})`
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
              {store.background.type === "solid" && (
                <div className="space-y-2">
                  <Label>Solid Color</Label>
                  <HexColorPicker
                    color={store.background.solid}
                    onChange={(color) =>
                      store.setBackground({
                        ...store.background,
                        solid: color,
                      })
                    }
                  />
                </div>
              )}

              {store.background.type !== "none" &&
                store.background.type !== "solid" && (
                  <div className="space-y-2">
                    <Slider
                      label="Blur"
                      min={2}
                      max={20}
                      step={1}
                      value={[store.background.blur]}
                      onValueChange={([value]) =>
                        store.setBackground({
                          ...store.background,
                          blur: value,
                        })
                      }
                    />
                  </div>
                )}
              {store.background.type === "gradient" && (
                <div className="space-y-4">
                  <ScrollArea className="h-56">
                    <div className="grid grid-cols-3 gap-2">
                      {PREDEFINED_GRADIENTS.map((grad) => (
                        <div
                          key={grad.label}
                          className="h-10 rounded cursor-pointer border"
                          style={{ backgroundImage: grad.gradient }}
                          onClick={() =>
                            store.setBackground({
                              ...store.background,
                              gradient: grad.gradient,
                            })
                          }
                          title={grad.label}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {store.background.type === "image" && (
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
                          store.setBackground({
                            ...store.background,
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
                        store.setBorder({
                          ...store.border,
                          type: e as BorderStyle,
                        });
                      }}
                      className={cn(
                        "w-10 h-8 rounded flex items-center justify-center cursor-pointer border border-border",
                        store.border.type === e && "bg-primary/30",
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
                  label={`Border width (${store.border.width}px)`}
                  min={0}
                  max={6}
                  step={0.1}
                  value={[store.border.width]}
                  onValueChange={([value]) =>
                    store.setBorder({ ...store.border, width: value })
                  }
                />
                <Slider
                  label={`Border Radius (${store.border.radius}px)`}
                  min={0}
                  max={30}
                  step={0.5}
                  value={[store.border.radius]}
                  onValueChange={([value]) =>
                    store.setBorder({ ...store.border, radius: value })
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
                          style={{ backgroundColor: store.border.color }}
                        ></span>
                        <Input
                          value={store.border.color}
                          onChange={(e) =>
                            store.setBorder({
                              ...store.border,
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
                      color={parseRgba(store.border.color)}
                      onChange={(rgba) => {
                        store.setBorder({
                          ...store.border,
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

        <BottomToolbar
          store={store}
          downloading={downloading}
          handleQuickEdit={handleQuickEdit}
          handleReset={handleReset}
          handleExport={handleExport}
        />
      </div>
      <UpperToolbar
        handleShareWithCrosspostHub={handleShareWithCrosspostHub}
        store={store}
      />
    </div>
  );
};

export default CodeEditor;

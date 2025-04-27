"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { LOCAL_IMAGES, PREDEFINED_GRADIENTS } from "@/lib/constants";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { Collapsible } from "../../ui/custom-collapsible";
import { ScrollArea } from "../../ui/scroll-area";
import { Slider } from "../../ui/slider";
import { IconRefresh } from "@tabler/icons-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BorderStyle } from "@/Types/Types";
import { parseRgba } from "@/lib/parseRGBA";
import GithubProfileCard from "./GithubProfileCard";
import {
  PREDEFINED_THEMES,
  useGithubEditStore,
} from "@/store/MainStore/useGithubEditStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WindowFrame } from "../WindowFrame";
import { useCaptureImage, useCollapsibleManager } from "../EditTools";
import { GetBackgroundStyle } from "../EditTools";
import BottomToolbar from "../BottomToolbar";
import UpperToolbar from "../UpperToolbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DragUpload } from "../DragUpload";
import { customToast } from "@/components/CreatePost/customToast";

export function GithubEditor() {
  const store = useGithubEditStore();
  const { handleCollapsibleToggle, openCollapsibles } = useCollapsibleManager();
  const exportRef = React.useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const router = useRouter();
  const { captureImage, downloading } = useCaptureImage(exportRef);

  const handleExport = React.useCallback(async () => {
    const imageData = await captureImage();
    if (imageData) {
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `${store.username}-graph.png`;
      link.click();
    }
  }, [store, captureImage]);

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
    store.fetchGithubUser();
  }, []);

  React.useEffect(() => {
    if (store.windowFrame.type != "none") {
      store.setBorder({
        type: "none",
        radius: 0,
        color: "",
        width: 0,
      });
    }
  }, [store.windowFrame]);

  const handleReset = React.useCallback(() => {
    store.setGraphTweeks({
      year: "last",
      blockMargin: 2,
      blockSize: 12,
      blockRadius: 3,
    });

    store.setBackground({
      type: "image",
      image: "/wallpaper/w1.jpg",
    });
    store.setBorder({
      type: "double",
      color: "#333333",
      width: 2,
      radius: 15,
    });
    store.setWindowFrame({
      type: "none",
      transparent: false,
      colorized: false,
    });
  }, [store]);

  const handleQuickEdit = React.useCallback(() => {
    store.setBackground({
      type: "image",
      image: "/wallpaper/w2.jpg",
    });

    store.setCardBlur({
      blur: 18,
      brightness: 0.5,
    });

    store.setBorder({
      type: "double",
      color: "rgba(255, 255, 255, 0.23)",
      width: 4,
      radius: 30,
    });
  }, [store]);

  return (
    <div className="flex md:flex-row flex-col gap-2 h-[calc(100vh-70px)] w-full">
      <div className="bg-secondary/30 p-3 w-full overflow-hidde relative rounded-2xl border flex items-center justify-center">
        <div
          ref={exportRef}
          style={{
            ...GetBackgroundStyle(store),
            backdropFilter: `blur(${store.background.blur}px)`,
            WebkitBackdropFilter: `blur(${store.background.blur}px)`,
          }}
        >
          <WindowFrame
            border={store.windowFrame.frameBorder}
            type={store.windowFrame.type}
            colorized={store.windowFrame.colorized}
            transparent={store.windowFrame.transparent}
          >
            <GithubProfileCard />
          </WindowFrame>
        </div>
      </div>
      <div className="scroll-custom bg-secondary/30 md:w-1/3 md:h-[calc(100vh-70px)] overflow-y-auto rounded-2xl border p-2 flex flex-col gap-2 justify-between">
        <div className="space-y-2">
          <form className="relative">
            <Input
              value={store.username}
              onChange={(e) => store.setUsername(e.target.value)}
              placeholder="github username"
              className="rounded-full border-neutral-700 bg-neutral-800 px-4 py-6 text-white placeholder:text-neutral-400"
            />
            <button
              onClick={async (e) => {
                e.preventDefault();
                await store.fetchGithubUser();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-emerald-500"
            >
              <IconRefresh
                height={35}
                width={35}
                className={
                  store.isLoading ? "animate-spin text-emerald-500" : ""
                }
              />
            </button>
          </form>

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
                      label={`Card Blur (${store.cardBlur.blur}px)`}
                      min={0}
                      max={20}
                      step={0.5}
                      value={[store.cardBlur.blur]}
                      onValueChange={([value]) =>
                        store.setCardBlur({
                          ...store.cardBlur,
                          blur: value,
                        })
                      }
                    />
                    <Slider
                      label={`Card Brightness (${store.cardBlur.brightness * 100}%)`}
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={[store.cardBlur.brightness]}
                      onValueChange={([value]) =>
                        store.setCardBlur({
                          ...store.cardBlur,
                          brightness: value,
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
                  <DragUpload store={store} />
                </div>
              )}
            </div>
          </Collapsible>

          <Collapsible
            trigger="Border"
            open={openCollapsibles.includes("Border")}
            onOpenChange={(isOpen) => handleCollapsibleToggle("Border", isOpen)}
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
                  max={10}
                  step={0.1}
                  value={[store.border.width]}
                  onValueChange={([value]) =>
                    store.setBorder({ ...store.border, width: value })
                  }
                />
                <Slider
                  label={`Border Radius (${store.border.radius}px)`}
                  min={0}
                  max={150}
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

          <Collapsible
            trigger="Themes"
            open={openCollapsibles.includes("Themes")}
            onOpenChange={(isOpen) => handleCollapsibleToggle("Themes", isOpen)}
          >
            <div className="space-y-3">
              {
                <div className="grid grid-cols-2 gap-2">
                  {PREDEFINED_THEMES.map((theme) => (
                    <Button
                      key={theme.label}
                      variant={
                        store.theme === theme.values ? "default" : "secondary"
                      }
                      className="w-full"
                      onClick={() => {
                        store.setTheme(theme.values);
                      }}
                    >
                      {theme.label}
                    </Button>
                  ))}
                </div>
              }
            </div>
          </Collapsible>

          {/* Tweek Graph */}
          <Collapsible
            trigger="Tweek Graph"
            open={openCollapsibles.includes("Tweek")}
            onOpenChange={(isOpen) => handleCollapsibleToggle("Tweek", isOpen)}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="relative mt-1">
                  <Select
                    value={
                      store.graphTweeks.year === "last"
                        ? "last"
                        : String(store.graphTweeks.year)
                    }
                    onValueChange={(value) =>
                      store.setGraphTweeks({
                        ...store.graphTweeks,
                        year: value === "last" ? "last" : parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="rounded-full border-neutral-700 bg-neutral-800 px-4 py-2 text-white">
                      <SelectValue placeholder="Contribution Year">
                        {store.graphTweeks.year === "last"
                          ? "Last Year"
                          : store.graphTweeks.year}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last">Last Year</SelectItem>
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Slider
                  label={`Block radius (${store.graphTweeks.blockRadius}px)`}
                  min={0}
                  max={10}
                  step={0.1}
                  value={[store.graphTweeks.blockRadius]}
                  onValueChange={([value]) =>
                    store.setGraphTweeks({
                      ...store.graphTweeks,
                      blockRadius: value,
                    })
                  }
                />
                <Slider
                  label={`Block margin (${store.graphTweeks.blockMargin}px)`}
                  min={0}
                  max={7}
                  step={0.5}
                  value={[store.graphTweeks.blockMargin]}
                  onValueChange={([value]) =>
                    store.setGraphTweeks({
                      ...store.graphTweeks,
                      blockMargin: value,
                    })
                  }
                />
                <Slider
                  label={`Block Size  (${store.graphTweeks.blockSize}px)`}
                  min={10}
                  max={20}
                  step={0.1}
                  value={[store.graphTweeks.blockSize]}
                  onValueChange={([value]) =>
                    store.setGraphTweeks({
                      ...store.graphTweeks,
                      blockSize: value,
                    })
                  }
                />
              </div>
            </div>
          </Collapsible>
        </div>
        <BottomToolbar
          downloading={downloading}
          handleExport={handleExport}
          handleQuickEdit={handleQuickEdit}
          handleReset={handleReset}
          store={store}
        />

        <UpperToolbar
          handleShareWithCrosspostHub={handleShareWithCrosspostHub}
          store={store}
        />
      </div>
    </div>
  );
}

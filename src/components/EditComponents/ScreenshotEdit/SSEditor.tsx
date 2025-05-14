"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { WindowFrame } from "@/components/EditComponents/WindowFrame";
import { LOCAL_IMAGES, PREDEFINED_GRADIENTS } from "@/lib/constants";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { Collapsible } from "../../ui/custom-collapsible";
import { ScrollArea } from "../../ui/scroll-area";
import html2canvas from "html2canvas";
import { customToast } from "../../CreatePost/customToast";
import { Slider } from "../../ui/slider";
import { useSession } from "next-auth/react";
import {
  IconCircleArrowDownFilled,
  IconLoader,
  IconReload,
} from "@tabler/icons-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BorderStyle } from "@/Types/Types";
import { parseRgba } from "@/lib/parseRGBA";
import { ImageUpload } from "./ImageUpload";
import { ScreeshotPreview } from "./ScreeshotPreview";
import { useScreenshotEditStore } from "@/store/MainStore/useSSEditStore";
import {
  GetBackgroundStyle,
  useCaptureImage,
  useCollapsibleManager,
} from "../EditTools";
import UpperToolbar from "../UpperToolbar";
import BottomToolbar from "../BottomToolbar";
import { DragUpload } from "../DragUpload";

export const SSEditor: React.FC = () => {
  const { data } = useSession();
  const store = useScreenshotEditStore();
  const { handleCollapsibleToggle, openCollapsibles } = useCollapsibleManager();
  const exportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { captureImage, downloading } = useCaptureImage(exportRef);

  const handleExport = React.useCallback(async () => {
    const imageData = await captureImage();
    if (imageData) {
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `crossposthub-ss.png`;
      link.click();
    }
  }, [captureImage]);

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

  useEffect(() => {
    if (store.windowFrame.type != "none") {
      store.setBorder({
        type: "none",
        radius: 0,
        color: "",
        width: 0,
      });
    }
  }, [store.windowFrame]);

  const handleQuickEdit = React.useCallback(() => {
    store.setBackground({
      type: "image",
      image: "/wallpaper/w2.jpg",
    });

    store.setBorder({
      color: "rgba(255, 255, 255, 0.2)",
      width: 8,
      radius: 30,
    });
  }, []);

  const handleReset = React.useCallback(() => {
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
  }, []);

  return (
    <div className="flex md:flex-row flex-col gap-2 h-[calc(100vh-70px)] w-full">
      {/* Screenshot   Preview Section */}
      <div className="group bg-secondary/30 w-full overflow-hidden relative rounded-2xl border">
        <div
          className={cn(
            !store.screenshot
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 ",
            "transition-opacity duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          )}
        >
          <ImageUpload />
        </div>
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
              // shadow={store.windowFrame.shadow}
              border={store.windowFrame.frameBorder}
              username={data?.user?.name?.toLowerCase().replace(" ", "")}
              type={store.windowFrame.type}
              transparent={store.windowFrame.transparent}
              colorized={store.windowFrame.colorized}
            >
              <ScreeshotPreview />
            </WindowFrame>
          </Card>
        </div>
      </div>

      {/* Window Frame and Background Settings */}
      <div className="scroll-custom bg-secondary/30 md:w-1/4 md:h-[calc(100vh-70px)] overflow-y-auto rounded-2xl border p-2 flex flex-col gap-2 justify-between">
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
                  <DragUpload store={store} />
                </div>
              )}
            </div>
          </Collapsible>

          <Collapsible
            trigger="Tweak"
            open={openCollapsibles.includes("Tweak")}
            onOpenChange={(isOpen) => handleCollapsibleToggle("Tweak", isOpen)}
          >
            <div className="space-y-3">
              <Slider
                label={`Image Scale (${store.imageScale}px)`}
                min={0}
                max={5}
                step={0.05}
                value={[store.imageScale]}
                onValueChange={([value]) => store.setImageScale(value)}
              />
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
        </div>

        <BottomToolbar
          downloading={downloading}
          handleExport={handleExport}
          handleQuickEdit={handleQuickEdit}
          handleReset={handleReset}
          store={store}
        />
      </div>
      <UpperToolbar
        handleShareWithCrosspostHub={handleShareWithCrosspostHub}
        store={store}
      />
    </div>
  );
};

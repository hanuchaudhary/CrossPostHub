"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, ImageIcon, Check } from "lucide-react";
import { useMediaStore } from "@/store/MainStore/usePostStore";
import { customToast } from "./customToast";
import { Textarea } from "../ui/textarea";
import { useLatestSubscription } from "@/hooks/useLatestSubscription";

export const EnhanceAndImageGen = ({
  caption,
  setContent,
}: {
  caption: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [enhancedCaption, setEnhancedCaption] = useState("");

  const { setMedias, handleFileUpload, medias } = useMediaStore();

  const convertUrlToImage = async (url: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Failed to get canvas context.");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "generated-image.png", {
                type: "image/png",
              });
              resolve(file);
            } else {
              reject(new Error("Failed to convert canvas to blob."));
            }
          }, "image/png");
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = url;
    });
  };

  const generateImage = async (caption: string) => {
    try {
      setIsGenerating(true);
      const res = await fetch("/api/generate/image", {
        method: "POST",
        body: JSON.stringify({ caption }),
      });
      const data = await res.json();
      const url = data?.images?.images?.[0]?.url;
      if (url) {
        setImageUrl(url);
        customToast({
          title: "Image Generated",
          description: "Your image has been successfully generated.",
        });
      }
      if (data.error) {
        customToast({
          title: "Image Generation Failed",
          description: data.error,
        });
      }
    } catch (error) {
      console.log("Error generating image:", error);
      if (error instanceof Error) {
        console.log("Error message:", error.message);
        customToast({
          title: "Image Generation Failed",
          description: error.message,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceCaption = async (content: string) => {
    if (!content.trim()) return;

    setIsEnhancing(true);
    try {
      const response = await axios.get("/api/generate", {
        params: {
          content,
          tone: "engaging",
          platform: "twitter",
        },
      });

      if (response.data.error) {
        customToast({
          title: "Failed to enhance caption",
          description: response.data.error,
        });
        setIsEnhancing(false);
        return;
      }

      const generatedContent = response.data.caption;
      setEnhancedCaption(generatedContent);
      customToast({
        title: "Caption Enhanced",
        description: "Your caption has been successfully enhanced.",
      });
    } catch (error) {
      customToast({
        title: "Failed to enhance caption",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptImage = async () => {
    if (!imageUrl) return;
    try {
      const image = await convertUrlToImage(imageUrl);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(image);
      handleFileUpload(dataTransfer.files, ["twitter"]);
      setMedias(medias);
      resetDialog();
    } catch (error) {
      console.error("Failed to convert image URL:", error);
      customToast({
        title: "Image Error",
        description: "Could not process the generated image.",
      });
    }
  };

  const handleAcceptCaption = () => {
    if (enhancedCaption) {
      setContent(enhancedCaption);
      setEnhancedCaption("");
      customToast({
        title: "Caption Accepted",
        description: "Enhanced caption has been applied.",
      });
      resetDialog();
    }
  };

  const handleCancel = () => {
    resetDialog();
  };

  const resetDialog = () => {
    setIsOpen(false);
    setImageUrl("");
    setEnhancedCaption("");
    setIsGenerating(false);
    setIsEnhancing(false);
  };

  const { subscriptionStatus, loading } = useLatestSubscription();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg px-3 py-1 bg-neutral-800/30 border-[1.5px] font-ClashDisplayMedium tracking-wider border-neutral-500 dark:text-neutral-300 hover:text-neutral-200 transition duration-200 text-xs group flex items-center gap-2 dark:hover:bg-neutral-600 hover:bg-neutral-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ">
          CPH
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-emerald-500 gap-2 font-ClashDisplayRegular tracking-wide">
            Content Processing Hub
          </DialogTitle>
          <DialogDescription>
            Enhance your caption or generate an image based on it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="dark:bg-neutral-900 bg-neutral-100 h-full w-full rounded-2xl border">
              <Textarea
                className="border-none py-3 focus-visible:ring-0 focus-visible:outline-none shadow-none resize-none"
                value={caption}
                placeholder="Type your caption here..."
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          {!imageUrl && !enhancedCaption && !isGenerating && !isEnhancing && (
            <div className="gap-2 flex  justify-end">
              <button
                onClick={() => generateImage(caption.trim())}
                disabled={
                  !caption.trim() ||
                  isGenerating ||
                  loading ||
                  subscriptionStatus !== "active" // TODO: GENERATED MEDIA COUNT CHECK
                }
                className="rounded-3xl px-3 py-1 border-[1.2px] font-ClashDisplayMedium tracking-wide border-neutral-500 dark:text-neutral-300 hover:text-neutral-200 transition duration-200 text-xs group flex items-center gap-2 dark:hover:bg-neutral-600 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed "
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Image"
                )}
              </button>
              <button
                onClick={() => enhanceCaption(caption.trim())}
                disabled={!caption.trim() || isEnhancing}
                className="rounded-3xl px-3 py-1 border-[1.2px] font-ClashDisplayMedium tracking-wide border-neutral-500 dark:text-neutral-300 hover:text-neutral-200 transition duration-200 text-xs group flex items-center gap-2 dark:hover:bg-neutral-600 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed "
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  "Enhance Caption"
                )}
              </button>
            </div>
          )}

          {(isGenerating || isEnhancing) && (
            <div className="w-full flex items-center justify-center py-8">
              <div className="inline-block">
                <div className="flex items-center px-5 justify-center gap-2 bg-secondary/50 border-2 py-2 font-ClashDisplayMedium tracking-wider rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    {isEnhancing
                      ? "Enhancing your caption"
                      : "Creating your masterpiece"}
                  </p>
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            </div>
          )}

          {imageUrl && !isGenerating && !isEnhancing && (
            <div className="space-y-2">
              <Label className="text-sm">Generated Image</Label>
              <div className="relative rounded-2xl overflow-hidden border bg-muted/20">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Generated Preview"
                  className="w-full h-64 object-contain"
                />
              </div>
              <DialogFooter className="sm:justify-between mt-4 font-ClashDisplayRegular">
                <Button type="button" variant="link" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleAcceptImage} className="gap-2">
                  <Check className="h-4 w-4" />
                  Accept Image
                </Button>
              </DialogFooter>
            </div>
          )}

          {enhancedCaption && !isGenerating && !isEnhancing && (
            <div className="space-y-2">
              <Label className="text-sm">Enhanced Caption</Label>
              <div className="relative rounded-md overflow-hidden border bg-muted/20 p-4">
                <p className="text-sm">{enhancedCaption}</p>
              </div>
              <DialogFooter className="sm:justify-between mt-4 font-ClashDisplayRegular">
                <Button type="button" variant="link" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleAcceptCaption} className="gap-2">
                  <Check className="h-4 w-4" />
                  Accept Caption
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

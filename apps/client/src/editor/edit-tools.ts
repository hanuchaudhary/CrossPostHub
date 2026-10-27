import { toast } from "sonner";
import React from "react";
import domtoimage from "dom-to-image";
import { getCanvasSize, loadImage, waitForCanvas } from "./canvas-renderer";

export const getBackgroundStyle = (store: any) => {
  switch (store.background.type) {
    case "solid":
      return {
        backgroundColor: store.background.solid,
        borderRadius: "16px",
        padding: "24px",
      };
    case "gradient":
      return {
        backgroundImage: store.background.gradient,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "16px",
        padding: "24px",
      };
    case "image":
      return {
        backgroundImage: `url(${store.background.image})`,
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
};

export const useCollapsibleManager = (
  initialOpen: string[] = ["Select Frame", "Background"],
) => {
  const [openCollapsibles, setOpenCollapsibles] =
    React.useState<string[]>(initialOpen);

  const handleCollapsibleToggle = (trigger: string, isOpen: boolean) => {
    setOpenCollapsibles((prev) => {
      if (isOpen) {
        const newOpen = [...prev, trigger];
        if (newOpen.length > 2) {
          return newOpen.slice(1);
        }
        return newOpen;
      } else {
        return prev.filter((item) => item !== trigger);
      }
    });
  };

  return {
    openCollapsibles,
    handleCollapsibleToggle,
  };
};

export const useCaptureImage = (
  exportRef: React.RefObject<HTMLDivElement | HTMLCanvasElement | null>,
) => {
  const [downloading, setDownloading] = React.useState(false);
  const capturing = React.useRef(false);
  const captureImage = React.useCallback(async (): Promise<string | null> => {
    const node = exportRef.current;
    if (!node || capturing.current) return null;
    capturing.current = true;
    setDownloading(true);
    try {
      await document.fonts.ready;
      if (node instanceof HTMLCanvasElement) {
        await waitForCanvas(node);
        return node.toDataURL("image/png");
      }
      await Promise.all(
        Array.from(node.querySelectorAll("img")).map((image) => image.decode()),
      );
      const width = Math.ceil(
        Math.max(node.scrollWidth, node.getBoundingClientRect().width),
      );
      const height = Math.ceil(
        Math.max(node.scrollHeight, node.getBoundingClientRect().height),
      );
      const size = getCanvasSize(width, height);
      const svg = await domtoimage.toSvg(node, { width, height });
      const image = await loadImage(svg);
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable in this browser.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, size.width, size.height);
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Image capture failed:", error);
      toast.error("Capture Failed", {
        description:
          error instanceof Error ? error.message : "Could not export image.",
      });
      return null;
    } finally {
      capturing.current = false;
      setDownloading(false);
    }
  }, [exportRef]);
  return { captureImage, downloading };
};

export async function getImageFromUrl(url: string) {
  try {
    await loadImage(url);
    return url;
  } catch {
    return null;
  }
}

import React from "react";
import { customToast } from "../CreatePost/customToast";
import domtoimage from "dom-to-image";

export const GetBackgroundStyle = (store: any) => {
  return React.useMemo(() => {
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
  }, [store.background]);
};

export const useCollapsibleManager = (
  initialOpen: string[] = ["Select Frame", "Background "]
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
  exportRef: React.RefObject<HTMLDivElement | null>
) => {
  const [downloading, setDownloading] = React.useState(false);

  const captureImage = React.useCallback(async (): Promise<string | null> => {
    if (!exportRef.current) {
      customToast({
        title: "Capture Failed",
        description: "No content to capture.",
      });
      return null;
    }

    setDownloading(true);
    try {
      const dataUrl = await domtoimage.toPng(exportRef.current, {
        bgcolor: "transparent",
        quality: 3,
        filter: (node) => true
      });
      return dataUrl;
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
  }, [exportRef]);

  return { captureImage, downloading };
};

export async function getImageFromUrl(url: string) {
  try {
    const img = new Image();
    img.src = url;
    await new Promise((resolve) => (img.onload = resolve));
    console.log("Image loaded successfully:", url);
    
    return url;
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
}

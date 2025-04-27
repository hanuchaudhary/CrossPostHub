import html2canvas from "html2canvas";
import React, { useCallback } from "react";
import { customToast } from "../CreatePost/customToast";

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
    if (!exportRef.current) return null;
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

  return {
    downloading,
    captureImage,
  };
};

import { BorderStyle } from "@/Types/Types";
import { create } from "zustand";

interface ScreenshotEditStore {
  screenshot: string;
  setScreenshot: (screenshot: File | null) => void;
  originalScreenshotDimension: {
    width: number;
    height: number;
  };

  resolution: {
    height: number;
    width: number;
  };
  setResolution: ({ height, width }: { height: number; width: number }) => void;

  background: {
    type: "none" | "image" | "gradient" | "solid";
    image: string;
    gradient: string;
    solid: string;
    blur: number;
  };
  setBackground: ({
    type,
    image,
    gradient,
    solid,
    blur,
  }: {
    type: "none" | "image" | "gradient" | "solid";
    image?: string;
    gradient?: string;
    solid?: string;
    blur?: number;
  }) => void;

  windowFrame: {
    type?: "none" | "macos" | "browser" | "window" | "arc";
    transparent: boolean | undefined;
    colorized: boolean | undefined;
    frameBorder: {
      type?: BorderStyle;
      color: string;
      width: number;
      radius: number;
    };
  };

  setWindowFrame: ({
    type,
    transparent,
    colorized,
  }: {
    type?: "none" | "macos" | "browser" | "window" | "arc";
    transparent?: boolean | undefined;
    colorized?: boolean | undefined;
    frameBorder?: {
      type?: BorderStyle;
      color: string;
      width: number;
      radius: number;
    };
  }) => void;

  border: {
    type?: BorderStyle;
    color: string;
    width: number;
    radius: number;
  };
  setBorder: ({
    type,
    color,
    width,
    radius,
  }: {
    type?: BorderStyle;
    color: string;
    width: number;
    radius: number;
  }) => void;
}

export const useScreenshotEditStore = create<ScreenshotEditStore>(
  (set, get) => ({
    screenshot: "",
    originalScreenshotDimension: {
      width: 0,
      height: 0,
    },
    setScreenshot: (screenshot) => {
      if (screenshot) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const screenshotUrl = e.target.result as string;
            set(() => ({
              screenshot: screenshotUrl,
              originalScreenshotDimension: screenshot
                ? { width: 0, height: 0 }
                : { width: 0, height: 0 },
            }));
          }
        };
        reader.readAsDataURL(screenshot);
      }
    },

    resolution: {
      height: 0,
      width: 0,
    },
    setResolution: ({ height, width }) => {
      return set(() => ({
        resolution: { height, width },
      }));
    },
    
    background: {
      type: "none",
      image: "",
      gradient: "",
      solid: "",
      blur: 0,
    },
    setBackground: ({ type, image, gradient, solid, blur }) =>
      set((state) => ({
        background: {
          ...state.background,
          type: type ?? state.background.type,
          image: image ?? state.background.image,
          gradient: gradient ?? state.background.gradient,
          solid: solid ?? state.background.solid,
          blur: blur ?? state.background.blur,
        },
      })),

    windowFrame: {
      type: "none",
      transparent: false,
      colorized: false,
      frameBorder: {
        type: "none",
        color: "#000000",
        width: 0,
        radius: 0,
      },
    },
    setWindowFrame: ({ type, transparent, colorized, frameBorder }) =>
      set((state) => ({
        windowFrame: {
          ...state.windowFrame,
          type: type ?? state.windowFrame.type,
          transparent: transparent ?? state.windowFrame.transparent,
          colorized: colorized ?? state.windowFrame.colorized,
          frameBorder: frameBorder ?? state.windowFrame.frameBorder,
        },
      })),

    border: {
      type: "none",
      color: "#000000",
      width: 0,
      radius: 0,
    },
    setBorder: ({ type, color, width, radius }) =>
      set(() => ({
        border: { type, color, width, radius },
      })),
  })
);

import { BorderStyle } from "@/Types/Types";
import { create } from "zustand";

type ResolutionPreset = {
  id: string;
  name: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
};

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: "auto",
    name: "Auto",
    label: "Auto",
    width: 0,
    height: 0,
    aspectRatio: "auto",
  },
  {
    id: "square",
    name: "Square",
    label: "1:1",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  {
    id: "standard",
    name: "Standard",
    label: "4:3",
    width: 1280,
    height: 960,
    aspectRatio: "4:3",
  },
  {
    id: "golden",
    name: "Golden",
    label: "1.618:1",
    width: 1618,
    height: 1000,
    aspectRatio: "1.618:1",
  },
  {
    id: "widescreen",
    name: "Widescreen",
    label: "16:9",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
  },
  {
    id: "classic",
    name: "Classic",
    label: "3:2",
    width: 1500,
    height: 1000,
    aspectRatio: "3:2",
  },
  {
    id: "photo",
    name: "Photo",
    label: "5:4",
    width: 1250,
    height: 1000,
    aspectRatio: "5:4",
  },
  {
    id: "twitter-wide",
    name: "X (Twitter)",
    label: "16:9",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
  },
  {
    id: "twitter-header",
    name: "X Header",
    label: "3:1",
    width: 1500,
    height: 500,
    aspectRatio: "3:1",
  },
];

interface ScreenshotEditStore {
  screenshot: File | null;
  originalScreenshotDimension: {
    width: number;
    height: number;
  };
  setScreenshot: (screenshot: File | null) => void;

  resolution: {
    height: number;
    width: number;
  };
  setResolution: ({ height, width }: { height: number; width: number }) => void;

  screenshotBackground: {
    type: "none" | "image" | "gradient" | "solid";
    image: string;
    gradient: string;
    solid: string;
    blur: number;
  };
  setScreenshotBackground: ({
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

  screenshotWindowFrame: {
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

  setScreenshotWindowFrame: ({
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

  screenshotBorder: {
    type?: BorderStyle;
    color: string;
    width: number;
    radius: number;
  };
  setScreenshotBorder: ({
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
    screenshot: null,
    originalScreenshotDimension: {
      width: 0,
      height: 0,
    },
    setScreenshot: (screenshot) => {
      // We'll need to get dimensions from an Image object
      if (screenshot) {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src); // Clean up
          set({
            originalScreenshotDimension: {
              width: img.width,
              height: img.height,
            },
          });
        };
        img.src = URL.createObjectURL(screenshot);
      }

      return set(() => ({
        screenshot,
        originalScreenshotDimension: screenshot
          ? { width: 0, height: 0 }
          : { width: 0, height: 0 },
      }));
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
    screenshotBackground: {
      type: "none",
      image: "",
      gradient: "",
      solid: "",
      blur: 0,
    },
    setScreenshotBackground: ({ type, image, gradient, solid, blur }) =>
      set((state) => ({
        screenshotBackground: {
          ...state.screenshotBackground,
          type: type ?? state.screenshotBackground.type,
          image: image ?? state.screenshotBackground.image,
          gradient: gradient ?? state.screenshotBackground.gradient,
          solid: solid ?? state.screenshotBackground.solid,
          blur: blur ?? state.screenshotBackground.blur,
        },
      })),

    screenshotWindowFrame: {
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
    setScreenshotWindowFrame: ({ type, transparent, colorized, frameBorder }) =>
      set((state) => ({
        screenshotWindowFrame: {
          ...state.screenshotWindowFrame,
          type: type ?? state.screenshotWindowFrame.type,
          transparent: transparent ?? state.screenshotWindowFrame.transparent,
          colorized: colorized ?? state.screenshotWindowFrame.colorized,
          frameBorder: frameBorder ?? state.screenshotWindowFrame.frameBorder,
        },
      })),

    screenshotBorder: {
      type: "none",
      color: "#000000",
      width: 0,
      radius: 0,
    },
    setScreenshotBorder: ({ type, color, width, radius }) =>
      set(() => ({
        screenshotBorder: { type, color, width, radius },
      })),
  })
);

import { loadEditorDraft, saveEditorDraft } from "@/editor/draft-storage";
import { BorderStyle } from "@/types/types";
import { create } from "zustand";
import { loadImage } from "@/editor/canvas-renderer";
import { toast } from "sonner";

let screenshotRequest = 0;

interface ScreenshotEditStore {
  screenshot: string;
  setScreenshot: (screenshot: File | null) => void;
  originalScreenshotDimension: {
    width: number;
    height: number;
  };

  imageScale: number;
  setImageScale: (imageScale: number) => void;

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

  saveDraft: () => void;
  loadDraft: () => void;
}

export const useScreenshotEditStore = create<ScreenshotEditStore>(
  (set, get) => ({
    screenshot: "",
    originalScreenshotDimension: {
      width: 0,
      height: 0,
    },
    setScreenshot: (screenshot) => {
      const request = ++screenshotRequest;
      if (!screenshot) {
        set({
          screenshot: "",
          originalScreenshotDimension: { width: 0, height: 0 },
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const source = reader.result as string;
          const image = await loadImage(source);
          if (request !== screenshotRequest) return;
          set({
            screenshot: source,
            originalScreenshotDimension: {
              width: image.naturalWidth,
              height: image.naturalHeight,
            },
          });
        } catch {
          if (request === screenshotRequest)
            toast.error("Could not read screenshot.");
        }
      };
      reader.onerror = () => {
        if (request === screenshotRequest)
          toast.error("Could not read screenshot.");
      };
      reader.readAsDataURL(screenshot);
    },

    imageScale: 1,
    setImageScale: (imageScale) => {
      set(() => ({
        imageScale,
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

    background: {
      type: "none",
      image: "",
      gradient: "linear-gradient(0deg, #1a1a3d, #4a4a8d)",
      solid: "#ffffff",
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
      colorized: true,
      frameBorder: {
        type: "solid",
        color: "#262626",
        width: 2,
        radius: 22,
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
      type: "solid",
      color: "#262626",
      width: 2,
      radius: 20,
    },
    setBorder: ({ type, color, width, radius }) =>
      set(() => ({
        border: { type, color, width, radius },
      })),

    saveDraft: () => saveEditorDraft("ScreenshotEditorDraft", get()),
    loadDraft: () => {
      const draft = loadEditorDraft("ScreenshotEditorDraft", get());
      if (draft) set(draft);
    },
  }),
);

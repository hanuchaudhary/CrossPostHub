import { DEFAULT_CODE } from "@/lib/constants";
import { create } from "zustand";

interface CodeEditorStore {
  code: string;
  setCode: (code: string) => void;

  highlightedCodeLines: number[];
  setHighlightedCodeLines: (lines: number[]) => void;

  backgroundImage: string;
  setBackgroundImage: (image: string) => void;

  codeBackgroundColor: string;
  setCodeBackgroundColor: (color: string) => void;

  language: string;
  setLanguage: (lang: string) => void;

  fileName: string;
  setFileName: (name: string) => void;

  backgroundType: string;
  setBackgroundType: (type: string) => void;

  gradientBackground: string;
  setGradientBackground: (gradient: string) => void;

  background: string;
  setBackground: (background: string) => void;

  windowFrame: {
    type?: "none" | "macos" | "browser" | "window" | "arc";
    transparent: boolean | undefined;
    colorized: boolean | undefined;
  };
  setWindowFrame: ({
    type,
    transparent,
    colorized,
  }: {
    type?: "none" | "macos" | "browser" | "window" | "arc";
    transparent?: boolean | undefined;
    colorized?: boolean | undefined;
  }) => void;
}

export const useCodeEditorStore = create<CodeEditorStore>((set) => ({
  code: DEFAULT_CODE,
  setCode: (code) => set({ code }),

  highlightedCodeLines: [],
  setHighlightedCodeLines: (lines) => set({ highlightedCodeLines: lines }),

  backgroundImage: "",
  setBackgroundImage: (image) => set({ backgroundImage: image }),

  codeBackgroundColor: "#0f172a",
  setCodeBackgroundColor: (color) => set({ codeBackgroundColor: color }),

  fileName: "crossposthub.tsx",
  setFileName: (name) => set({ fileName: name }),

  language: "tsx",
  setLanguage: (lang) => set({ language: lang }),

  backgroundType: "image",
  setBackgroundType: (type) => set({ backgroundType: type }),

  gradientBackground: "",
  setGradientBackground: (gradient) => set({ gradientBackground: gradient }),

  background: "",
  setBackground: (background) => set({ background }),

  windowFrame: {
    type: "none",
    transparent: false,
    colorized: false,
  },
  setWindowFrame: ({ type, transparent, colorized }) =>
    set((state) => ({
      windowFrame: {
        ...state.windowFrame,
        type: type ?? state.windowFrame.type,
        transparent: transparent ?? state.windowFrame.transparent,
        colorized: colorized ?? state.windowFrame.colorized,
      },
    })),
}));

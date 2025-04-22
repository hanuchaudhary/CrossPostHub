import { DEFAULT_CODE } from "@/lib/constants";
import { BorderStyle } from "@/Types/Types";
import { create } from "zustand";

export interface CodeEditorStore {
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
    color?: string;
    width?: number;
    radius?: number;
  }) => void;

  theme?: any;
  setTheme: (theme: any) => void;

  saveDraft: () => void;
  loadDraft: () => void;
}

export const useCodeEditorStore = create<CodeEditorStore>((set, get) => ({
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

  windowFrame: {
    type: "none",
    transparent: false,
    colorized: true,
    frameBorder: {
      type: "solid",
      color: "#333333",
      width: 1,
      radius: 15,
    },
  },
  setWindowFrame: ({ type, transparent, colorized, frameBorder }) =>
    set((state) => ({
      windowFrame: {
        ...state.windowFrame,
        type: type ?? state.windowFrame.type,
        transparent: transparent ?? state.windowFrame.transparent,
        colorized: colorized ?? state.windowFrame.colorized,
        frameBorder: {
          ...state.windowFrame.frameBorder,
          type: frameBorder?.type ?? state.windowFrame.frameBorder.type,
          color: frameBorder?.color ?? state.windowFrame.frameBorder.color,
          radius: frameBorder?.radius ?? state.windowFrame.frameBorder.radius,
          width: frameBorder?.width ?? state.windowFrame.frameBorder.width,
        },
      },
    })),

  background: {
    type: "none",
    image: "/wallpaper/w1.jpg",
    gradient: "linear-gradient(0deg, #1a1a3d, #4a4a8d)",
    solid: "#ffffff",
    blur: 2,
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

  border: {
    type: "solid",
    color: "#333333",
    width: 1,
    radius: 15,
  },
  setBorder: ({ type, color, width, radius }) =>
    set((state) => ({
      border: {
        ...state.border,
        type: type ?? state.border.type,
        color: color ?? state.border.color,
        width: width ?? state.border.width,
        radius: radius ?? state.border.radius,
      },
    })),

  theme: "",
  setTheme: (theme) => set({ theme }),

  saveDraft: () => {
    const state = get();
    const { saveDraft, loadDraft, ...stateToSave } = state;
    localStorage.setItem("codeEditorDraft", JSON.stringify(stateToSave));
  },

  loadDraft: () => {
    const draft = localStorage.getItem("codeEditorDraft");
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      set(parsedDraft);
    }
  },
}));

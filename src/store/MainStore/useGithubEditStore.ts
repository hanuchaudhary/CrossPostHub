import { BorderStyle } from "@/Types/Types";
import { create } from "zustand";

export const PREDEFINED_THEMES = [
  {
    label: "orange",
    values: ["#161B22", "#7B2D00", "#D44D00", "#FFA500", "#FFD89B"],
  },
  {
    label: "blue",
    values: ["#161B22", "#0A2740", "#156B8A", "#58B2DC", "#A6E1FA"],
  },
  {
    label: "green",
    values: ["#161B22", "#005249", "#2D7F67", "#6EC6A6", "#B8F2C2"],
  },
  {
    label: "purple",
    values: ["#383939", "#4C5264", "#626E95", "#798CC7", "#8FA8FA"],
  },
  {
    label: "red",
    values: ["#161B22", "#7A0B02", "#C21F1A", "#FF5733", "#FFA07A"],
  },
  {
    label: "yellow",
    values: ["#161B22", "#665C00", "#C4A000", "#FFD700", "#FFF5B1"],
  },
  {
    label: "pink",
    values: ["#161B22", "#6A1B4D", "#C2185B", "#F06292", "#FFC1E3"],
  },
  {
    label: "cyan",
    values: ["#161B22", "#005F73", "#0A9396", "#94D2BD", "#E9F5DB"],
  },
  {
    label: "teal",
    values: ["#161B22", "#004D40", "#00897B", "#4DB6AC", "#B2DFDB"],
  },
  {
    label: "indigo",
    values: ["#161B22", "#2C387E", "#3F51B5", "#7986CB", "#C5CAE9"],
  },
  {
    label: "brown",
    values: ["#161B22", "#4E342E", "#795548", "#A1887F", "#D7CCC8"],
  },
];

interface GithubEditStore {
  username: string;
  setUsername: (username: string) => void;

  githubUser: {
    avatar_url: string;
    login: string;
    name: string;
    bio: string;
    followers: number;
    following: number;
    totalCommits: number;
    yearsActive: number;
  };
  fetchGithubUser: () => Promise<void>;
  isLoading: boolean;

  graphTweaks: {
    year: number | "last";
    blockMargin: number;
    blockSize: number;
    blockRadius: number;
  };
  setGraphTweaks: ({
    year,
    blockMargin,
    blockSize,
    blockRadius,
  }: {
    year: number | "last";
    blockMargin: number;
    blockSize: number;
    blockRadius: number;
  }) => void;

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
    shadow?: string;
  };
  setWindowFrame: ({
    type,
    transparent,
    colorized,
    frameBorder,
    shadow,
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
    shadow?: string;
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

  theme: string[];
  setTheme: (theme: string[]) => void;

  cardBlur: {
    blur: number; // New: Blur intensity for the card
    brightness: number; // New: Brightness adjustment for the blurred card background
  };
  setCardBlur: ({
    blur,
    brightness,
  }: {
    blur: number; // New: Blur intensity for the card
    brightness: number; // New: Brightness adjustment for the blurred card background
  }) => void;

  saveDraft: () => void;
  loadDraft: () => void;
}

export const useGithubEditStore = create<GithubEditStore>((set, get) => ({
  username: "hanuchaudhary",
  setUsername: (username: string) => set({ username }),

  isLoading: false,
  githubUser: {
    avatar_url: "",
    login: "",
    name: "",
    bio: "",
    followers: 0,
    following: 0,
    totalCommits: 0,
    yearsActive: 0,
  },
  fetchGithubUser: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubUsername: get().username }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }
      set({ githubUser: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      set({ isLoading: false });
    }
  },

  cardBlur: {
    blur: 0,
    brightness: 1,
  },
  setCardBlur: ({
    blur,
    brightness,
  }: {
    blur: number;
    brightness: number; 
  }) =>
    set((state) => ({
      cardBlur: {
        ...state.cardBlur,
        blur,
        brightness,
      },
    })),

  background: {
    type: "image",
    image: "/wallpaper/w2.jpg",
    gradient: "",
    solid: "",
    blur: 0,
  },
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
  }) =>
    set((state) => ({
      background: {
        ...state.background,
        type,
        image: image || state.background.image,
        gradient: gradient || state.background.gradient,
        solid: solid || state.background.solid,
        blur: blur || state.background.blur,
      },
    })),

  windowFrame: {
    type: "none",
    transparent: false,
    colorized: true,
    frameBorder: {
      type: "solid",
      color: "#333333",
      width: 1.5,
      radius: 19,
    },
    shadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
  },
  setWindowFrame: ({
    type,
    transparent,
    colorized,
    frameBorder,
    shadow,
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
    shadow?: string;
  }) =>
    set((state) => ({
      windowFrame: {
        ...state.windowFrame,
        type,
        transparent: transparent || state.windowFrame.transparent,
        colorized: colorized || state.windowFrame.colorized,
        frameBorder: {
          ...state.windowFrame.frameBorder,
          type: frameBorder?.type || state.windowFrame.frameBorder.type,
          color: frameBorder?.color || state.windowFrame.frameBorder.color,
          width: frameBorder?.width || state.windowFrame.frameBorder.width,
          radius: frameBorder?.radius || state.windowFrame.frameBorder.radius,
        },
        shadow: shadow || state.windowFrame.shadow,
      },
    })),

  border: {
    type: "double",
    color: "#333333",
    width: 2,
    radius: 19,
  },
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
  }) =>
    set((state) => ({
      border: {
        ...state.border,
        type: type || state.border.type,
        color: color || state.border.color,
        width: width || state.border.width,
        radius: radius || state.border.radius,
      },
    })),

  theme: PREDEFINED_THEMES[3].values,
  setTheme: (theme: any) => set({ theme }),

  graphTweaks: {
    year: "last",
    blockMargin: 2,
    blockSize: 12,
    blockRadius: 3,
  },
  setGraphTweaks: ({
    year,
    blockMargin,
    blockSize,
    blockRadius,
  }: {
    year: number | "last";
    blockMargin: number;
    blockSize: number;
    blockRadius: number;
  }) =>
    set((state) => ({
      graphTweaks: {
        ...state.graphTweaks,
        year,
        blockMargin,
        blockSize,
        blockRadius,
      },
    })),

  saveDraft: () => {
    const state = get();
    const { saveDraft, loadDraft, ...stateToSave } = state;
    localStorage.setItem("GithubEditorDraft", JSON.stringify(stateToSave));
  },

  loadDraft: () => {
    const draft = localStorage.getItem("GithubEditorDraft");
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      set(parsedDraft);
    }
  },
}));

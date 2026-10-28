import { createContext, useContext, useEffect, useState } from "react";

import type {
  Theme,
  ThemeProviderProps,
  ThemeProviderState,
} from "@/lib/types";

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = () => {
        root.classList.toggle("dark", media.matches);
        root.classList.toggle("light", !media.matches);
      };
      applySystemTheme();
      media.addEventListener("change", applySystemTheme);
      return () => media.removeEventListener("change", applySystemTheme);
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

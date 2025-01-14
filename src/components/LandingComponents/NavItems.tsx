import React from "react";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "../ui/switch";

export default function NavItems() {
  const { setTheme, theme } = useTheme();
  return (
    <nav className="flex items-center space-x-4">
      <Button size={"sm"}>Try it Free</Button>
      <div className="flex items-center space-x-2">
        <Switch
          id="theme-switch"
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
        <label htmlFor="theme-switch" className="sr-only">
          Toggle theme
        </label>
        <span className="inline-flex">
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </span>
      </div>
    </nav>
  );
}

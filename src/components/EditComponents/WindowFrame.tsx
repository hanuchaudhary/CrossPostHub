import { BorderStyle } from "@/Types/Types";
import { IconBoxMultiple, IconMinus } from "@tabler/icons-react";
import { X } from "lucide-react";
import type React from "react";

interface WindowFrameProps {
  children: React.ReactNode;
  type?: "none" | "macos" | "browser" | "window" | "arc";
  transparent?: boolean;
  colorized?: boolean;
  title?: string;
  username?: string;
  border: {
    type?: BorderStyle;
    color: string;
    width: number;
    radius: number;
  };
  shadow?: string;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  shadow,
  username,
  children,
  type = "none",
  transparent = false,
  colorized = false,
  title = "code-snippet.tsx",
  border,
}) => {
  if (type === "none") {
    return <>{children}</>;
  }

  const bgClass = transparent
    ? "bg-secondary/90 backdrop-blur-md"
    : "bg-neutral-900";
  const borderClass = "border-b border-neutral-800";

  // Common dots for macOS style windows
  const MacOSDots = () => (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full ${colorized ? "bg-red-500" : "bg-neutral-600"}`}
      />
      <div
        className={`h-3 w-3 rounded-full ${colorized ? "bg-yellow-500" : "bg-neutral-600"}`}
      />
      <div
        className={`h-3 w-3 rounded-full ${colorized ? "bg-green-500" : "bg-neutral-600"}`}
      />
    </div>
  );

  if (type === "macos") {
    return (
      <div
        style={{
          borderRadius: border.radius,
          borderWidth: border.width,
          borderStyle: border.type,
          borderColor: border.color,
          boxShadow: shadow,
        }}
        className="overflow-hidden rounded-lg border border-neutral-800"
      >
        <div
          className={`flex items-center gap-2 p-3 ${bgClass} ${borderClass}`}
        >
          <MacOSDots />
          <div className="flex-1 text-center">
            <div className="text-xs text-neutral-400 font-medium">{title}</div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (type === "browser") {
    return (
      <div
        style={{
          borderRadius: border.radius,
          borderWidth: border.width,
          borderStyle: border.type,
          borderColor: border.color,
          boxShadow: shadow,
        }}
        className="overflow-hidden rounded-lg border border-neutral-800"
      >
        <div
          className={`flex items-center gap-2 p-3 ${bgClass} ${borderClass}`}
        >
          <MacOSDots />
          <div className="flex-1 mx-2">
            <div className="bg-neutral-800 rounded-full px-2 py-1 text-xs text-neutral-400 flex items-center justify-center">
              <span className="truncate">
                https://{username}.com/{title.toLowerCase().replace(".", "-")}
              </span>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (type === "arc") {
    return (
      <div
        style={{
          borderRadius: border.radius,
          borderWidth: border.width,
          borderStyle: border.type,
          borderColor: border.color,
          boxShadow: shadow,
        }}
        className="overflow-hidden rounded-xl border border-neutral-800"
      >
        <div
          className={`flex items-center gap-2 p-2 ${bgClass} ${borderClass}`}
        >
          <div className="flex-1 mx-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MacOSDots />
                <div className="text-xs text-neutral-400 font-medium">
                  {title}
                </div>
              </div>
              <div className="bg-neutral-800 rounded-full px-3 py-1 text-xs text-neutral-400">
                <span className="truncate">
                  {username}.codes/{title.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (type === "window") {
    return (
      <div
        style={{
          borderRadius: border.radius,
          borderWidth: border.width,
          borderStyle: border.type,
          borderColor: border.color,
          boxShadow: shadow,
        }}
        className="overflow-hidden rounded-lg border border-neutral-800"
      >
        <div
          className={`flex items-center justify-between p-2 ${bgClass} ${borderClass}`}
        >
          <div className="text-xs text-neutral-400 font-medium px-2">
            {title}
          </div>
          <div className="flex gap-2">
            <IconMinus className="h-[14px] w-[14px] text-neutral-500" />
            <IconBoxMultiple className="h-[14px] w-[14px] text-neutral-500" />
            <div className="text-red-500">
              <X className="h-[14px] w-[14px]" />
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

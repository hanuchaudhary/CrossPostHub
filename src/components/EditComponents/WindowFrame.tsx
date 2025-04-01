import { IconBoxMultiple, IconMinus } from "@tabler/icons-react";
import { X } from "lucide-react";
import type React from "react";

interface WindowFrameProps {
  children: React.ReactNode;
  type?: "none" | "macos" | "browser" | "window";
  transparent?: boolean;
  colorized?: boolean;
}

const WindowFrame: React.FC<WindowFrameProps> = ({
  children,
  type = "none",
  transparent = false,
  colorized = false,
}) => {
  if (type === "none") {
    return <>{children}</>;
  }

  const bgClass = transparent ? "bg-transparent" : "bg-neutral-900";

  if (type === "macos") {
    return (
      <div className="overflow-hidden rounded-lg">
        <div className={`flex items-center gap-2 p-3 ${bgClass} border-b border-neutral-800`}>
          <div
            className={`h-3 w-3 rounded-full ${colorized ? "bg-red-500" : "bg-neutral-600"}`}
          />
          <div
            className={`h-3 w-3 rounded-full ${colorized ? "bg-yellow-500" : "bg-neutral-600"}`}
          />
          <div
            className={`h-3 w-3 rounded-full ${colorized ? "bg-green-500" : "bg-neutral-600"}`}
          />
          <div className="flex-1 text-center">
            <div className="text-xs text-neutral-400 font-medium">
              code-snippet.tsx
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (type === "browser") {
    return (
      <div className="overflow-hidden rounded-lg">
        <div
          className={`flex items-center gap-2 p-3 ${bgClass} border-b border-neutral-800`}
        >
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
          <div className="flex-1 mx-2">
            <div className="bg-neutral-800 rounded-full px-3 py-1 text-xs text-neutral-400 flex items-center justify-center">
              <span className="truncate">https://example.com/code-snippet</span>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (type === "window") {
    return (
      <div className="overflow-hidden rounded-lg">
        <div
          className={`flex items-center justify-between p-2 ${bgClass} border-b border-neutral-800 relative`}
        >
          <div className="text-xs text-neutral-400 font-medium px-2">
            Code Snippet
          </div>
          <div className="flex items-center gap-2 absolute right-2 top-2">
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

export default WindowFrame;

import React from "react";

interface WindowFrameProps {
  type: "none" | "macos" | "browser" | "window" | "arc";
  title?: string;
  children: React.ReactNode;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ type, title = "index.tsx", children }) => {
  if (type === "none") return <>{children}</>;

  const frames = {
    macos: (
      <div className="rounded-lg overflow-hidden bg-primary shadow-lg">
        <div className="bg-neutral-800 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-neutral-400 text-sm font-mono">{title}</span>
          </div>
          <div className="w-16" />
        </div>
        {children}
      </div>
    ),
    browser: (
      <div className="rounded-lg overflow-hidden bg-white shadow-lg">
        <div className="bg-neutral-800 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-neutral-700 rounded px-3 py-1 text-center">
              <span className="text-neutral-300 text-sm">localhost:3000</span>
            </div>
          </div>
        </div>
        {children}
      </div>
    ),
    window: (
      <div className="rounded-lg overflow-hidden bg-white shadow-lg">
        <div className="bg-neutral-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-sm">{title}</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
          </div>
        </div>
        {children}
      </div>
    ),
    arc: (
      <div className="rounded-lg overflow-hidden bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 shadow-lg">
        <div className="bg-neutral-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">{title}</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
            <div className="w-3 h-3 rounded-full bg-neutral-600" />
          </div>
        </div>
        {children}
      </div>
    ),
  };

  return frames[type] || null;
};

export default WindowFrame;

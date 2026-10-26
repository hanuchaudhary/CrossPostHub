import { cn } from "@/lib/utils";
import { useScreenshotEditStore } from "@/store/MainStore/useSSEditStore";
import React from "react";

export function ScreeshotPreview() {
  const ssStore = useScreenshotEditStore();

  return (
    <div className="flex items-center justify-center">
      {ssStore.screenshot && (
        <div className="relative h-full">
          <img
            style={{
              transform: `scale(${ssStore.imageScale})`,
              borderRadius: ssStore.border.radius,
              borderStyle: ssStore.border.type,
              borderWidth: ssStore.border.width,
              borderColor: ssStore.border.color,
            }}
            src={ssStore.screenshot}
            alt="Screenshot"
            className={cn(
              "object-contain rounded-xl",
              ssStore.windowFrame.type == "none" ? "h-[calc(100vh-300px)]" : ""
            )}
          />
        </div>
      )}
    </div>
  );
}

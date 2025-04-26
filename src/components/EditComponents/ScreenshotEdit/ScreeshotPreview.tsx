import { useScreenshotEditStore } from "@/store/MainStore/useSSEditStore";
import Image from "next/image";
import React from "react";

// interface ScreenshotPreviewProps {
//   shadow: string;
//   border?: {
//     type?: BorderStyle;
//     color: string;
//     width: number;
//     radius: number;
//   };
// }

export function ScreeshotPreview() {
  const ssStore = useScreenshotEditStore();

  return (
    <div className="flex items-center justify-center">
      {ssStore.screenshot && (
        <div className="relative h-full">
          <img
            src={ssStore.screenshot}
            alt="Screenshot"
            className="object-contain rounded-xl h-full"
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScreenshotEditStore } from "@/store/MainStore/useSSEditStore";
import { IconUpload, IconWorldUpload } from "@tabler/icons-react";
import { useRef } from "react";

export const ImageUpload = () => {
  const ssStore = useScreenshotEditStore();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleInputClick = () => {
    let fileInput = inputRef.current;
    if (!fileInput) return;
    fileInput.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    ssStore.setScreenshot(file);
  };

  return (
    <div className="flex flex-col gap-2 border p-3 m-3 rounded-3xl bg-secondary/60 backdrop-blur-sm">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleInputClick}
          variant="outline"
          className="flex border items-center justify-center gap-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
        >
          <IconUpload className="h-5 w-5" />
          <span>Select</span>
          <input
            onChange={handleImageChange}
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            multiple={false}
          />
        </Button>
        <Button
          onClick={async () => {
            const response = await fetch("/demo.png");
            const blob = await response.blob();
            const file = new File([blob], "demo.png", { type: blob.type });
            ssStore.setScreenshot(file);
          }}
          variant="outline"
          className="flex border items-center justify-center gap-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
        >
          <span>Demo</span>
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="website.com or link.."
          className="rounded-full border-neutral-700 bg-neutral-800 px-4 py-2 text-white placeholder:text-neutral-400"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
          <IconWorldUpload />
        </button>
      </div>
    </div>
  );
};

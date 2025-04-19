"use client";

import axios from "axios";
import React from "react";
import { customToast } from "./customToast";

export default function EnhanceCaption({
  content,
  setContent,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const response = await axios.get("/api/generate", {
        params: {
          content,
          tone: "engaging",
          platform: "twitter",
        },
      });

      if (response.data.error) {
        customToast({
          title: "Failed to generate content",
          description: response.data.error,
        });
        setIsGenerating(false);
        return;
      }

      const generatedContent = response.data.caption;
      setContent(generatedContent);
      setIsGenerating(false);
    } catch (error) {
      customToast({
        title: "Failed to generate content",
        description: "An unexpected error occurred.",
      });
      setIsGenerating(false);
    }
  };
  return (
    <button
      disabled={isGenerating || !content.trim()}
      onClick={handleGenerate}
      className="rounded-3xl px-3 py-1 border-[1.2px] font-ClashDisplayRegular border-neutral-500 dark:text-neutral-300 hover:text-neutral-200 transition duration-200 text-xs group flex items-center gap-2 dark:hover:bg-neutral-600 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed "
    >
      {isGenerating ? "Enhancing..." : "Enhance"}
    </button>
  );
}

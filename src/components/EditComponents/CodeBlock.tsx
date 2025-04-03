"use client";

import React, { useEffect } from "react";
import { CodeBlock } from "@/components/ui/code-block";

type CodeBlockDemoProps = {
  code: string;
  langauge: string;
  filename?: string;
  highlightLines: number[];
};

export function CustomCodeBlock({
  code,
  highlightLines,
  langauge = "tsx",
  filename = "filename.tsx",
}: CodeBlockDemoProps) {useEffect(() => {
    console.log(
      "CodeBlockDemo useEffect",
      code,
      highlightLines,
      langauge,
      filename
    );
  }, [code, highlightLines, langauge, filename]);


  return (
    <div className="w-full">
      <CodeBlock
        language={langauge}
        filename={filename}
        highlightLines={highlightLines}
        code={code}
      />
    </div>
  );
}

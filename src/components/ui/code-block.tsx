"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type CodeBlockProps = {
  language: string;
  filename: string;
  highlightLines?: number[];
  backgroundColor?: string;
  code: string;
};


export const CodeBlock = ({
  backgroundColor = "transparent",
  language,
  filename,
  code,
  highlightLines = [],
}: CodeBlockProps) => {
  const fontSize = code.length > 1000 ? "0.6rem" : "0.875rem"; // Adjust font size based on code length
  console.log(code.length, fontSize);
  
  return (
    <div
      className="relative max-w-5xl w-[880px] rounded-lg bg-slate-900 p-4 font-mono text-sm"
      style={{ backgroundColor }}
    >
      {filename && (
        <div className="flex justify-between items-center py-2">
          <div className="text-xs text-neutral-400">{filename}</div>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontSize
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: highlightLines.includes(lineNumber)
              ? "rgba(255,255,255,0.1)"
              : "transparent",
            display: "block",
            width: "100%",
          },
        })}
        PreTag="div"
      >
        {String(code)}
      </SyntaxHighlighter>
    </div>
  );
};

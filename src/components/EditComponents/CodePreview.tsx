import React, { Ref } from "react";
import { Card } from "../ui/card";
import { CodeBlock } from "./CodeBlock";
import { WindowFrame } from "./WindowFrame";
import { CodeEditorStore } from "@/store/EditStore/useEditStore";

interface CodePreviewProps {
  getBackgroundStyle: any;
  windowFrame: CodeEditorStore["windowFrame"];
  theme: any;
  border: CodeEditorStore["border"];
  codeBackgroundColor: string;
  code: string;
  language: string;
  fileName: string;
  highlightedCodeLines: number[];
  exportRef: Ref<HTMLDivElement>;
  data: any;
}

export const CodePreview = React.memo(
  ({
    getBackgroundStyle,
    windowFrame,
    theme,
    border,
    codeBackgroundColor,
    code,
    language,
    fileName,
    highlightedCodeLines,
    exportRef,
    data,
  }: CodePreviewProps) => (
    <div className="bg-secondary/30 rounded-2xl border">
      <div
        ref={exportRef}
        style={{
          ...getBackgroundStyle,
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <Card className="border-none bg-transparent shadow-none transition-all duration-200 p-0 w-full">
          <WindowFrame
            username={data?.user?.name?.toLowerCase().replace(" ", "")}
            title={fileName}
            type={windowFrame.type}
            transparent={windowFrame.transparent}
            colorized={windowFrame.colorized}
          >
            <CodeBlock
              theme={theme}
              border={border}
              backgroundColor={codeBackgroundColor}
              code={code}
              language={language}
              filename={fileName}
              highlightLines={highlightedCodeLines}
            />
          </WindowFrame>
        </Card>
      </div>
    </div>
  )
);
CodePreview.displayName = "CodePreview";

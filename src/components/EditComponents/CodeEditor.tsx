"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { WindowFrame } from "@/components/EditComponents/WindowFrame";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useCodeEditorStore } from "@/store/EditStore/useEditStore";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CodeBlock } from "../ui/code-block";
import { Switch } from "../ui/switch";

const CodeEditor: React.FC = () => {
  const {
    highlightedCodeLines,
    setHighlightedCodeLines,
    setCode,
    language,
    setLanguage,
    fileName,
    setFileName,
    code,
    codeBackgroundColor,
    setCodeBackgroundColor,
    windowFrame,
    setWindowFrame,
  } = useCodeEditorStore();
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  return (
    <div className="flex gap-2 min-h-[70vh]">
      {/* Code Editor Section */}
      <div className="w-full bg-secondary/30 rounded-2xl p-[10px] border border-border flex flex-col gap-6">
        <div className="space-y-2">
          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="min-h-80 resize-none rounded-[12px] border border-border bg-secondary/40 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
            placeholder="Paste your code here..."
            style={{
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Label className="text-sm">Background Color</Label>
                  <div className="relative mt-2">
                    <span
                      className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                      style={{ backgroundColor: codeBackgroundColor }}
                    ></span>
                    <Input
                      value={codeBackgroundColor}
                      onChange={(e) => setCodeBackgroundColor(e.target.value)}
                      placeholder="Background Color"
                      className="rounded-[12px] border border-border bg-secondary/40 p-4 pl-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
                    />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <HexColorPicker
                  color={codeBackgroundColor}
                  onChange={(color) => {
                    setCodeBackgroundColor(color);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>langauge</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>File Name</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              className="rounded-[12px] border border-border bg-secondary/40 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
            />
          </div>

          <div className="space-y-2">
            <Label>Highlight Lines</Label>
            <Input
              // value={highlightedCodeLines.join(",")}
              onChange={(e) => {
                const lines = e.target.value
                  .split(",")
                  .map(Number)
                  .filter(Boolean);
                setHighlightedCodeLines(lines);
              }}
              type="text"
              placeholder="Enter line numbers separated by commas"
              className="rounded-[12px] border border-border bg-secondary/40 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/80"
            />
          </div>

          <div className="space-y-2">
            <Button
              className="w-full flex items-center justify-center gap-2"
              // onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Code Preview Section */}
      <div className="bg-secondary/30 rounded-2xl border">
        <div
          // style={getBackgroundStyle()}
          className="w-full h-full rounded-xl p-8 flex items-center justify-center"
          // ref={exportRef}
        >
          <Card className="overflow-hidden border-neutral-800 transition-all duration-200 backdrop-blur-sm bg-secondary/80 rounded-xl p-0 shadow-xl max-w-3xl w-full">
            <WindowFrame
              title={fileName}
              type={windowFrame.type}
              transparent={windowFrame.transparent}
              colorized={windowFrame.colorized}
            >
              <CodeBlock
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

      <div className="bg-secondary/30 rounded-2xl border w-full p-2">
        <Label>Window Frame</Label>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="w-full"
              >
                <span>
                  {windowFrame.type === "none" ? "Select Frame" : windowFrame.type}
                </span>
                <span className="sr-only">Open frame settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Frame Decoration</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "macOS", value: "macos" },
                      { label: "Browser", value: "browser" },
                      { label: "Window", value: "window" },
                      { label: "Arc", value: "arc" },
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant={
                          windowFrame.type === type.value
                            ? "default"
                            : "outline"
                        }
                        className="w-full"
                        onClick={() => {
                          setWindowFrame({
                            ...windowFrame,
                            type: type.value as "macos" | "browser" | "window",
                          });
                        }}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Transparency</span>
                    <Switch
                      checked={windowFrame.transparent}
                      onCheckedChange={(checked) =>
                        setWindowFrame({
                          ...windowFrame,
                          transparent: checked,
                        })
                      }
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Colorized Controls</span>
                    <Switch
                      checked={windowFrame.colorized}
                      onCheckedChange={(checked) =>
                        setWindowFrame({
                          ...windowFrame,
                          colorized: checked,
                        })
                      }
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

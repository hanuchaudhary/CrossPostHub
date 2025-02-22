"use client";

import { Button } from "@/components/ui/button";
import { Canvas } from "fabric";
import { toast } from "@/hooks/use-toast";
import { ControlPopover } from "./ControlPopover";
import { useImageStore } from "@/store/ImageStore/useImageStore";
import { useRouter } from "next/navigation";

interface ExportOptionsProps {
  canvas: Canvas | null;
}

export const ExportOptions = ({ canvas }: ExportOptionsProps) => {
    const router = useRouter();
  const { setImageData } = useImageStore();

  const exportImage = (quality: number, format: 'png' | 'jpeg') => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: format,
      quality: quality,
      multiplier: format === 'png' ? 1 : 1, // Always use multiplier 1
    });

    const link = document.createElement("a");
    link.download = `edited-image.${format}`;
    link.href = dataURL;
    link.click();

    toast({
      title: "Success!",
      description: `Your image has been downloaded as ${format.toUpperCase()}.`,
    });
  };

  const shareViaCrosspostHub = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'jpeg',
      multiplier: 1,
    });

    setImageData(dataURL);
    router.push("/create");
  };

  return (
    <ControlPopover
      toolkitTitle="Export"
      title="Export"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Export Options</h3>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            PNG Format
          </h4>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => exportImage(1.0, "png")}
          >
            Maximum Quality PNG
          </Button>

          <h4 className="text-sm font-medium text-muted-foreground mt-4">
            JPEG Format
          </h4>
          <div className="grid gap-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => exportImage(1.0, "jpeg")}
            >
              Best Quality JPEG
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => exportImage(0.8, "jpeg")}
            >
              High Quality JPEG
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => exportImage(0.6, "jpeg")}
            >
              Medium Quality JPEG
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => exportImage(0.4, "jpeg")}
            >
              Low Quality JPEG
            </Button>
          </div>

          <h4 className="text-sm font-medium text-muted-foreground mt-4">
            Share
          </h4>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={shareViaCrosspostHub}
          >
            Share via CrosspostHub
          </Button>
        </div>
      </div>
    </ControlPopover>
  );
}; 
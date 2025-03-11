import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onChange: (files: FileList | null) => void;
}

export function ImageUpload({ onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      const validFiles: File[] = [];
      let isValid = true;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/") && file.size > 4.5 * 1024 * 1024) {
          toast({
            title: `Image file "${file.name}" exceeds the maximum size of 4.5 MB.`,
            description: "Please upload a smaller image.",
          });
          isValid = false;
          break;
        } else if (
          file.type.startsWith("video/") &&
          file.size > 450 * 1024 * 1024
        ) {
          toast({
            title: `Video file "${file.name}" exceeds the maximum size of 450 MB.`,
            description: "Please upload a smaller video.",
            variant: "destructive",
          });
          isValid = false;
          break;
        } else if (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/")
        ) {
          toast({
            title: `File "${file.name}" is not a valid image or video file.`,
            description: "Please upload a valid image or video file.",
            variant: "destructive",
          });
          isValid = false;
          break;
        } else {
          validFiles.push(file);
        }
      }

      if (isValid) {
        onChange(
          validFiles.length > 0 ? (validFiles as unknown as FileList) : null
        );
      } else {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*, video/*"
        className="hidden"
      />
      <Button type="button" variant="outline" onClick={handleClick}>
        <ImagePlus className="mr-2 h-4 w-4" />
        Add Images or Videos
      </Button>
    </div>
  );
}

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onChange: (files: FileList | null) => void;
}

export function MediaUpload({ onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      const validFiles: File[] = [];
      let isValid = true;

      // Step 1: Determine the media type (all images or one video)
      const fileTypes = Array.from(files).map((file) =>
        file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "invalid"
      );

      // Check for invalid file types
      if (fileTypes.includes("invalid")) {
        const invalidFile = Array.from(files).find(
          (file) =>
            !file.type.startsWith("image/") && !file.type.startsWith("video/")
        );
        toast({
          title: `File "${invalidFile?.name}" is not a valid media file.`,
          description:
            "Please upload images (JPEG, PNG, GIF) or a video (MP4).",
          variant: "destructive",
        });
        isValid = false;
      }

      // Check for mixed media types
      const uniqueTypes = new Set(
        fileTypes.filter((type) => type !== "invalid")
      );
      if (uniqueTypes.size > 1) {
        toast({
          title: "Mixed Media Types",
          description:
            "Please upload either all images or one video, but not both.",
          variant: "destructive",
        });
        isValid = false;
      }

      // Step 2: Validate based on media type
      if (isValid) {
        const mediaType = fileTypes[0]; // Either "image" or "video"

        if (mediaType === "image") {
          // Quantity limit: 4 images max (X's limit)
          if (files.length > 4) {
            toast({
              title: "Too Many Images",
              description:
                "You can upload up to 4 images. Please select fewer images.",
              variant: "destructive",
            });
            isValid = false;
          }

          // Validate each image file
          if (isValid) {
            const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
            for (const file of Array.from(files)) {
              if (!validImageTypes.includes(file.type)) {
                toast({
                  title: `File "${file.name}" is not a valid image.`,
                  description: "Please upload a JPEG, PNG, or GIF file.",
                  variant: "destructive",
                });
                isValid = false;
                break;
              }

              // Check file size (5 MB max)
              if (file.size > 5 * 1024 * 1024) {
                toast({
                  title: `Image file "${file.name}" exceeds the maximum size of 5 MB.`,
                  description: "Please upload a smaller image.",
                  variant: "destructive",
                });
                isValid = false;
                break;
              }

              validFiles.push(file);
            }
          }
        } else if (mediaType === "video") {
          // Quantity limit: 1 video max
          if (files.length > 1) {
            toast({
              title: "Too Many Videos",
              description: "Only one video can be uploaded per post.",
              variant: "destructive",
            });
            isValid = false;
          }

          // Validate the single video file
          if (isValid && files.length === 1) {
            const file = files[0];
            const validVideoTypes = ["video/mp4"];
            if (!validVideoTypes.includes(file.type)) {
              toast({
                title: `File "${file.name}" is not a valid video.`,
                description: "Please upload an MP4 file.",
                variant: "destructive",
              });
              isValid = false;
            } else if (file.size > 100 * 1024 * 1024) {
              // 100 MB max (Instagram's limit)
              toast({
                title: `Video file "${file.name}" exceeds the maximum size of 100 MB.`,
                description: "Please upload a smaller video.",
                variant: "destructive",
              });
              isValid = false;
            } else {
              // Note: Video duration should be checked in the backend
              // X: 140 seconds, LinkedIn: 10 minutes, Instagram: 60 seconds
              validFiles.push(file);
            }
          }
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
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/jpeg,image/png,image/gif,video/mp4"
        className="hidden"
      />
      <Button type="button" variant="outline" onClick={handleClick}>
        <ImagePlus className="mr-2 h-4 w-4" />
        Add Images or Video
      </Button>
    </div>
  );
}

import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

interface MediaUploadProps {
  onChange: (data: {
    files: File[] | [] | null;
    mediaKeys: string[] | [] | null;
    isUploading: boolean;
  }) => void;
}

export function MediaUpload({ onChange }: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Helper function to check video duration
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        reject(new Error("Failed to load video metadata"));
      };
      video.src = window.URL.createObjectURL(file);
    });
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

                // Check file size (200 MB max)
                if (file.size > 200 * 1024 * 1024) {
                  toast({
                    title: `Image file "${file.name}" exceeds the maximum size of 200 MB.`,
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
              } else if (file.size > 200 * 1024 * 1024) {
                // Updated to 200 MB max
                toast({
                  title: `Video file "${file.name}" exceeds the maximum size of 200 MB.`,
                  description: "Please upload a smaller video.",
                  variant: "destructive",
                });
                isValid = false;
              } else {
                // Check video duration (client-side)
                try {
                  const duration = await getVideoDuration(file);
                  // X: 140 seconds, LinkedIn: 10 minutes (600 seconds), Instagram: 60 seconds
                  // Use the most restrictive limit (Instagram: 60 seconds) to ensure compatibility
                  if (duration > 200) {
                    toast({
                      title: `Video "${file.name}" is too long.`,
                      description:
                        "Videos must be 60 seconds or shorter to be compatible with all platforms.",
                    });
                    isValid = false;
                  } else {
                    validFiles.push(file);
                  }
                } catch (error) {
                  toast({
                    title: `Error validating video "${file.name}".`,
                    description: "Unable to check video duration.",
                    variant: "destructive",
                  });
                  isValid = false;
                }
              }
            }
          }
        }

        // Step 3: If valid, upload files to S3 using presigned URLs
        if (isValid && validFiles.length > 0) {
          setIsUploading(true);
          try {
            const mediaKeys: string[] = [];

            // Get presigned URLs and upload each file
            for (const file of validFiles) {
              const response = await axios.post("/api/post/preSignedUrl", {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
              });

              if (!response) {
                throw new Error(`Failed to get presigned URL for ${file.name}`);
              }

              const { url, key } = response.data;
              const uploadResponse = await axios.put(url, file, {
                headers: { "Content-Type": file.type },
              });

              if (!uploadResponse.status) {
                throw new Error(`Failed to upload ${file.name} to S3`);
              }

              mediaKeys.push(key);
            }

            // Step 4: Pass both files and mediaKeys to the parent component
            onChange({
              files: validFiles,
              mediaKeys,
              isUploading,
            });
          } catch (error) {
            toast({
              title: "Upload Error",
              description: "Failed to upload media to S3. Please try again.",
              variant: "destructive",
            });
            onChange({ files: [], mediaKeys: [], isUploading: false });
          } finally {
            setIsUploading(false);
          }
        } else {
          onChange({ files: [], mediaKeys: [], isUploading: false });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } else {
        onChange({ files: [], mediaKeys: [], isUploading: false });
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/jpeg,image/png,image/gif,video/mp4"
        className="hidden"
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isUploading}
      >
        <ImagePlus className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Add Images or Video"}
      </Button>
    </div>
  );
}

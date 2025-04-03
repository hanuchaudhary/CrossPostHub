/**
 * MediaUpload Component
 *
 * This component allows users to upload media files (images or videos) for a post.
 * It validates the uploaded files based on the selected platform's requirements
 * and uploads them to an S3 bucket using presigned URLs.
 *
 * @param {MediaUploadProps} props - The props for the MediaUpload component.
 * @param {(media: { files: File[]; mediaKeys: string[]; isUploading: boolean }) => void} props.onChange -
 * A callback function that is triggered when the media files are uploaded or validated.
 * It provides the uploaded files, their corresponding S3 keys, and the upload status.
 * @param {string[]} props.platforms - The selected platforms for the post.
 * This is used to analyze and validate the media files (e.g., video duration)
 * according to the platform's specific requirements.
 *
 * @remarks
 * - Supports uploading up to 4 images or 1 video per post.
 * - Validates file types (JPEG, PNG, GIF for images; MP4 for videos).
 * - Ensures file size does not exceed 200 MB.
 * - Checks video duration to ensure compatibility with all selected platforms.
 * - Displays error messages using `toast` for invalid files or upload errors.
 *
 * @example
 * ```tsx
 * <MediaUpload
 *   platforms={['X', 'LinkedIn', 'Instagram']}
 *   onChange={(media) => console.log(media)}
 * />
 * ```
 */

import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { getVideoDuration } from "@/utils/getVideoDuration";
import { customToast } from "./customToast";

interface MediaUploadProps {
  platforms?: string[] | null;
  onChange: (data: {
    files: File[] | [] | null;
    mediaKeys: string[] | [] | null;
    isUploading: boolean;
  }) => void;
}

export function MediaUpload({ onChange, platforms }: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleClick = () => {
    if (!platforms || platforms.length === 0) {
      // If no platforms are selected, show a toast message and return null
      customToast({
        title: "Select a platform first.",
        description:
          "Please select a platform before uploading media because the media upload is based on the platform's requirements.",
        badgeVariant: "destructive",
      });
      return null;
    }
    fileInputRef.current?.click();
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
          customToast({
            title: `File "${invalidFile?.name}" is not a valid image or video.`,
            description:
              "Please upload a valid image (JPEG, PNG, GIF) or video (MP4) file.",
            badgeVariant: "destructive",
          });
          isValid = false;
        }

        // Check for mixed media types
        const uniqueTypes = new Set(
          fileTypes.filter((type) => type !== "invalid")
        );
        if (uniqueTypes.size > 1) {
          customToast({
            title: "Mixed Media Types",
            description:
              "Please upload either all images or one video, but not both.",
            badgeVariant: "destructive",
          });
          isValid = false;
        }

        // Step 2: Validate based on media type
        if (isValid) {
          const mediaType = fileTypes[0]; // Either "image" or "video"

          if (mediaType === "image") {
            // Quantity limit: 4 images max (X's limit)
            if (files.length > 4) {
              customToast({
                title: "Too Many Images",
                description:
                  "You can upload up to 4 images. Please select fewer images.",
                badgeVariant: "destructive",
              });
              isValid = false;
            }

            // Validate each image file
            if (isValid) {
              const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
              for (const file of Array.from(files)) {
                if (!validImageTypes.includes(file.type)) {
                  customToast({
                    title: `File "${file.name}" is not a valid image.`,
                    description: "Please upload a JPEG, PNG, or GIF file.",
                    badgeVariant: "destructive",
                  });
                  isValid = false;
                  break;
                }

                // Check file size (200 MB max)
                if (file.size > 200 * 1024 * 1024) {
                  customToast({
                    title: `Image file "${file.name}" exceeds the maximum size of 200 MB.`,
                    description: "Please upload a smaller image.",
                    badgeVariant: "destructive",
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
              customToast({
                title: "Too Many Videos",
                description: "Only one video can be uploaded per post.",
                badgeVariant: "destructive",
              });
              isValid = false;
            }

            // Validate the single video file
            if (isValid && files.length === 1) {
              const file = files[0];
              const validVideoTypes = ["video/mp4"];
              if (!validVideoTypes.includes(file.type)) {
                customToast({
                  title: `File "${file.name}" is not a valid video.`,
                  description: "Please upload an MP4 file.",
                  badgeVariant: "destructive",
                });
                isValid = false;
              } else if (file.size > 200 * 1024 * 1024) {
                // Updated to 200 MB max
                customToast({
                  title: `Video file "${file.name}" exceeds the maximum size of 200 MB.`,
                  description: "Please upload a smaller video.",
                  badgeVariant: "destructive",
                });
                isValid = false;
              } else {
                // Check video duration (client-side)
                try {
                  const duration = await getVideoDuration(file);
                  // X: 140 seconds, LinkedIn: 10 minutes (600 seconds), Instagram: 60 seconds
                  // Use the most restrictive limit (Instagram: 60 seconds) to ensure compatibility
                  //TODO: Check if the video is too long for all platforms✅

                  if (duration > 60 && platforms?.includes("Instagram")) {
                    // instagram: 60 seconds
                    customToast({
                      title: `Video "${file.name}" is too long for Instagram.`,
                      description:
                        "Videos must be 60 seconds or shorter to be compatible with Instagram.",
                    });
                    isValid = false;
                  } else if (duration > 140) {
                    // X: 140 seconds
                    customToast({
                      title: `Video "${file.name}" is too long.`,
                      description:
                        "Videos must be 140 seconds or shorter to be compatible with X.",
                    });
                    isValid = false;
                  } else if (duration > 600) {
                    // LinkedIn: 10 minutes (600 seconds)
                    customToast({
                      title: `Video "${file.name}" is too long for LinkedIn.`,
                      description:
                        "Videos must be 10 minutes or shorter to be compatible with LinkedIn.",
                    });
                    isValid = false;
                  } else {
                    validFiles.push(file);
                  }
                } catch (error) {
                  customToast({
                    title: `Error validating video "${file.name}".`,
                    description: "Unable to check video duration.",
                    badgeVariant: "destructive",
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
            customToast({
              title: "Upload Error",
              description: "Failed to upload media to S3. Please try again.",
              badgeVariant: "destructive",
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

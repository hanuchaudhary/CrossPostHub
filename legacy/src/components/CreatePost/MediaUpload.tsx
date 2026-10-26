/**
 * MediaUpload Component
 *
 * This component allows users to upload media files (images or videos) for a post.
 * It triggers file uploads via a Zustand store and displays upload progress.
 *
 * @param {MediaUploadProps} props - The props for the MediaUpload component.
 * @param {string[]} props.platforms - The selected platforms for the post.
 *
 * @example
 * ```tsx
 * <MediaUpload platforms={['instagram', 'twitter', 'linkedin']} />
 * ```
 */

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { customToast } from "./customToast";
import { IconPhotoFilled } from "@tabler/icons-react";
import { useMediaStore } from "@/store/MainStore/usePostStore";
import { Platform } from "./CreatePostForm";

interface MediaUploadProps {
  platforms?: Platform[] | null;
}

export function MediaUpload({ platforms }: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileUpload, isUploadingMedia } =
    useMediaStore();

  const handleClick = () => {
    if (!platforms || platforms.length === 0) {
      customToast({
        title: "Select a platform first.",
        description:
          "Please select a platform before uploading media because the media upload is based on the platform's requirements.",
        badgeVariant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files, platforms || []);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input to allow re-uploading same file
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
        disabled={isUploadingMedia}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isUploadingMedia}
      >
        <IconPhotoFilled className="h-4 w-4" />
        {isUploadingMedia ? "Uploading..." : "Add Images or Video"}
      </Button>
    </div>
  );
}

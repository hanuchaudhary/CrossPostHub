import { useEffect, useRef, useState } from "react";

import { deleteMedia, uploadMedia } from "@/lib/api";

import {
  MediaUploadManager,
  type MediaUploadState,
} from "./media-upload-manager";

export function useMediaUploads() {
  const [entries, setEntries] = useState(new Map<File, MediaUploadState>());
  const manager = useRef<MediaUploadManager | null>(null);
  useEffect(() => {
    const uploads = new MediaUploadManager(uploadMedia, deleteMedia, () =>
      setEntries(uploads.snapshot())
    );
    manager.current = uploads;
    return () => {
      manager.current = null;
      uploads.dispose();
    };
  }, []);
  return {
    entries,
    start: (files: readonly File[]) =>
      files.forEach((file) => manager.current?.start(file)),
    retry: (file: File) => manager.current?.retry(file),
    release: (file: File) => manager.current?.release(file),
    keys: (files: readonly File[]) => {
      if (!files.length) return [];
      if (!manager.current)
        throw new Error("The uploader is not ready. Try again.");
      return manager.current.keys(files);
    },
    retain: (files: readonly File[]) => manager.current?.retain(files),
  };
}

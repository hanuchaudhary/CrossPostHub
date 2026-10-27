import { toast } from "sonner";
import { create } from "zustand";
import axios from "axios";
import { getVideoDuration } from "@/utils/get-video-duration";

type Platform = "instagram" | "twitter" | "linkedin";

interface UploadProgress {
  fileName: string;
  progress: number;
  abortController?: AbortController;
}

interface MediaState {
  medias: {
    files: File[] | null;
    mediaKeys: string[] | null;
  };
  isUploadingMedia: boolean;
  uploadProgress: UploadProgress[];
  setMedias: (medias: {
    files: File[] | null;
    mediaKeys: string[] | null;
  }) => void;
  resetMedias: () => void;
  handleFileUpload: (
    files: FileList | null,
    platforms: Platform[]
  ) => Promise<void>;
  cancelUpload: (fileName: string) => void;
  removeMedia: (fileName: string) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  medias: {
    files: null,
    mediaKeys: null,
  },
  isUploadingMedia: false,
  uploadProgress: [],

  setMedias: (medias) => set({ medias }),

  resetMedias: () =>
    set({
      medias: { files: null, mediaKeys: null },
      isUploadingMedia: false,
      uploadProgress: [],
    }),

  handleFileUpload: async (files: FileList | null, platforms: Platform[]) => {
    if (!files) {
      set({
        medias: { files: [], mediaKeys: [] },
        isUploadingMedia: false,
        uploadProgress: [],
      });
      return;
    }

    if (!platforms || platforms.length === 0) {
      throw new Error("Select a platform first.");
      return;
    }

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
      throw new Error(`File "${invalidFile?.name}" is not a valid image or video.`);
      isValid = false;
    }

    const uniqueTypes = new Set(fileTypes.filter((type) => type !== "invalid"));
    if (uniqueTypes.size > 1) {
      toast.error("Mixed Media Types", { description: "Please upload either all images or one video, but not both." });
      return;
      isValid = false;
    }

    // Step 2: Validate based on media type
    if (isValid) {
      const mediaType = fileTypes[0]; // Either "image" or "video"

      if (mediaType === "image") {
        // Quantity limit: 4 images max (X's limit)
        if (files.length > 4) {
          toast.error("Too Many Images", { description: "You can upload up to 4 images. Please select fewer images." });
      return;
          isValid = false;
        }

        // Validate each image file
        if (isValid) {
          const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
          for (const file of Array.from(files)) {
            if (!validImageTypes.includes(file.type)) {
              toast.error(`File "${file.name}" is not a valid image.`, { description: "Please upload a JPEG, PNG, or GIF file." });
      return;
              isValid = false;
              break;
            }

            // TODO: Check image dimensions (client-side)
            if (file.size > 5 * 1024 * 1024) {
              // 5 MB limit for images
              toast.error(`Image file "${file.name}" exceeds the maximum size of 5 MB.`, { description: "Please upload a smaller image." });
      return;
              isValid = false;
              break;
            }

            validFiles.push(file);
          }
        }
      } else if (mediaType === "video") {
        // Quantity limit: 1 video max
        if (files.length > 1) {
          toast.error("Too Many Videos", { description: "Only one video can be uploaded per post." });
      return;
          isValid = false;
        }

        // Validate the single video file
        if (isValid && files.length === 1) {
          const file = files[0];
          const validVideoTypes = ["video/mp4"];
          if (!validVideoTypes.includes(file.type)) {
            toast.error(`File "${file.name}" is not a valid video.`, { description: "Please upload an MP4 file." });
      return;
            isValid = false;
            // TODO: Increase size limit from 200 MB to 500 MB for video files
          } else if (file.size > 200 * 1024 * 1024) {
            toast.error(`Video file "${file.name}" exceeds the maximum size of 200 MB.`, { description: "Please upload a smaller video." });
      return;
            isValid = false;
          } else {
            // Check video duration (client-side)
            try {
              const duration = await getVideoDuration(file);
              if (duration > 60 && platforms.includes("instagram")) {
                toast.error(`Video "${file.name}" is too long for Instagram.`, { description: "Videos must be 60 seconds or shorter to be compatible with Instagram." });
      return;
                isValid = false;
              } else if (duration > 140 && platforms.includes("twitter")) {
                toast.error(`Video "${file.name}" is too long.`, { description: "Videos must be 140 seconds or shorter to be compatible with X." });
      return;
                isValid = false;
              } else if (duration > 600 && platforms.includes("linkedin")) {
                toast.error(`Video "${file.name}" is too long for LinkedIn.`, { description: "Videos must be 10 minutes or shorter to be compatible with LinkedIn." });
      return;
                isValid = false;
              } else {
                validFiles.push(file);
              }
            } catch (error) {
              toast.error(`Error validating video "${file.name}".`, { description: "Unable to check video duration." });
      return;
              isValid = false;
            }
          }
        }
      }
    }

    // Step 3: If valid, upload files to S3 using presigned URLs
    if (isValid && validFiles.length > 0) {
      const uploadProgress = validFiles.map((file) => ({
        fileName: file.name,
        progress: 0,
        abortController: new AbortController(),
      }));
      set({ isUploadingMedia: true, uploadProgress });

      try {
        const mediaKeys: string[] = [];
        const uploadedFiles: File[] = [];

        // Upload each file
        for (const file of validFiles) {
          const abortController = uploadProgress.find(
            (item) => item.fileName === file.name
          )?.abortController;

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
            signal: abortController?.signal, // Attach AbortSignal
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              set((state) => ({
                uploadProgress: state.uploadProgress.map((item) =>
                  item.fileName === file.name
                    ? { ...item, progress: percentCompleted }
                    : item
                ),
              }));
            },
          });

          if (!uploadResponse.status) {
            throw new Error(`Failed to upload ${file.name} to S3`);
          }
          mediaKeys.push(key);
          uploadedFiles.push(file);
        }

        set({
          medias: {
            files: uploadedFiles,
            mediaKeys,
          },
          isUploadingMedia: false,
          uploadProgress: [],
        });
      } catch (error: any) {
        if (error.name === "AbortError") {
          return;
        }
        set({
          medias: { files: [], mediaKeys: [] },
          isUploadingMedia: false,
          uploadProgress: [],
        });
      }
    } else {
      set({
        medias: { files: [], mediaKeys: [] },
        isUploadingMedia: false,
        uploadProgress: [],
      });
    }
  },

  cancelUpload: async (fileName: string) => {
    const { uploadProgress, medias } = get();

    const progressItem = uploadProgress.find(
      (item) => item.fileName === fileName
    );

    if (progressItem && progressItem.abortController) {
      progressItem.abortController.abort(
        `Upload of ${fileName} canceled by user.`
      );
    }

    const updatedProgress = uploadProgress.filter(
      (item) => item.fileName !== fileName
    );
    const isUploadingMedia = updatedProgress.length > 0;

    const updatedFiles = (medias.files || []).filter(
      (file) => file.name !== fileName
    );
    const updatedMediaKeys = (medias.mediaKeys || []).filter(
      (_, index) => medias.files?.[index]?.name !== fileName
    );

    set({
      uploadProgress: updatedProgress,
      isUploadingMedia,
      medias: {
        files: updatedFiles.length > 0 ? updatedFiles : null,
        mediaKeys: updatedMediaKeys.length > 0 ? updatedMediaKeys : null,
      },
    });

    toast.error(`Upload Canceled`, { description: `The upload of ${fileName} has been canceled.`, });
      return;
  },

  removeMedia: async (fileName: string) => {
    const { medias } = get();
    const mediaKey = medias.mediaKeys?.find(
      (_, index) => medias.files?.[index]?.name === fileName
    );
    if (mediaKey) {
      const updatedFiles = (medias.files || []).filter(
        (file) => file.name !== fileName
      );
      const updatedMediaKeys = (medias.mediaKeys || []).filter(
        (_, index) => medias.files?.[index]?.name === fileName
      );

      set({
        medias: {
          files: updatedFiles.length > 0 ? updatedFiles : null,
          mediaKeys: updatedMediaKeys.length > 0 ? updatedMediaKeys : null,
        },
      });

      toast.error("File Removed", { description: `The file ${fileName} has been removed.`, });
      return;

      // Attempt to delete the file from S3
      try {
        await axios.post(`/api/post/delete/media`, {
          mediaKey,
        });
      } catch (error) {
        console.error(`Failed to delete ${fileName} from S3:`, error);
        toast.error("S3 Deletion Failed", { description: `The file ${fileName} was removed, but we couldn't delete it from S3.`, });
      return;
      }
    }
  },
}));

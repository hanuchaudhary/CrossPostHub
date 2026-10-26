// stores/mediaStore.ts
import { create } from "zustand";
import axios from "axios";
import { customToast } from "@/components/CreatePost/customToast";
import { getVideoDuration } from "@/utils/getVideoDuration";

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
      customToast({
        title: "Select a platform first.",
        description:
          "Please select a platform before uploading media because the media upload is based on the platform's requirements.",
        badgeVariant: "destructive",
      });
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
      customToast({
        title: `File "${invalidFile?.name}" is not a valid image or video.`,
        description:
          "Please upload a valid image (JPEG, PNG, GIF) or video (MP4) file.",
        badgeVariant: "destructive",
      });
      isValid = false;
    }

    // Check for mixed media types
    const uniqueTypes = new Set(fileTypes.filter((type) => type !== "invalid"));
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

            // TODO: Check image dimensions (client-side)
            if (file.size > 5 * 1024 * 1024) {
              // 5 MB limit for images
              customToast({
                title: `Image file "${file.name}" exceeds the maximum size of 5 MB.`,
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
            // TODO: Increase size limit from 200 MB to 500 MB for video files
          } else if (file.size > 200 * 1024 * 1024) {
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
              if (duration > 60 && platforms.includes("instagram")) {
                customToast({
                  title: `Video "${file.name}" is too long for Instagram.`,
                  description:
                    "Videos must be 60 seconds or shorter to be compatible with Instagram.",
                  badgeVariant: "destructive",
                });
                isValid = false;
              } else if (duration > 140 && platforms.includes("twitter")) {
                customToast({
                  title: `Video "${file.name}" is too long.`,
                  description:
                    "Videos must be 140 seconds or shorter to be compatible with X.",
                  badgeVariant: "destructive",
                });
                isValid = false;
              } else if (duration > 600 && platforms.includes("linkedin")) {
                customToast({
                  title: `Video "${file.name}" is too long for LinkedIn.`,
                  description:
                    "Videos must be 10 minutes or shorter to be compatible with LinkedIn.",
                  badgeVariant: "destructive",
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

    customToast({
      title: `Upload Canceled`,
      description: `The upload of ${fileName} has been canceled.`,
    });
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

      customToast({
        title: "File Removed",
        description: `The file ${fileName} has been removed.`,
      });

      // Attempt to delete the file from S3
      try {
        await axios.post(`/api/post/delete/media`, {
          mediaKey,
        });
      } catch (error) {
        console.error(`Failed to delete ${fileName} from S3:`, error);
        customToast({
          title: "S3 Deletion Failed",
          description: `The file ${fileName} was removed, but we couldn't delete it from S3.`,
        });
      }
    }
  },
}));

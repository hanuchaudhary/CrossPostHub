import { Providers } from "@/Types/Types";

interface ValidationError {
  message: string;
  status: number;
}

export async function validateMedia(
  media: File[],
): Promise<void> {
  if (media.length === 0) return;

  // Step 1: Check single-type media restriction
  const mediaTypes = media.map((file) =>
    file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "invalid"
  );

  // Check for invalid file types
  if (mediaTypes.includes("invalid")) {
    const invalidFile = media.find(
      (file) =>
        !file.type.startsWith("image/") && !file.type.startsWith("video/")
    );
    throw {
      message: `File "${invalidFile?.name}" is not a valid media file. Only images (JPEG, PNG, GIF) or videos (MP4) are allowed.`,
      status: 400,
    } as ValidationError;
  }

  // Check for mixed media types
  const uniqueTypes = new Set(mediaTypes);
  if (uniqueTypes.size > 1) {
    throw {
      message:
        "Mixed media types are not allowed. Please upload either all images or one video.",
      status: 400,
    } as ValidationError;
  }

  // Step 2: Validate based on media type
  const mediaType = mediaTypes[0]; // Either "image" or "video"

  if (mediaType === "image") {
    // Quantity limit: 4 images max (X's limit)
    if (media.length > 4) {
      throw {
        message: "You can upload up to 4 images. Please select fewer images.",
        status: 400,
      } as ValidationError;
    }

    // Validate each image file
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    for (const file of media) {
      if (!validImageTypes.includes(file.type)) {
        throw {
          message: `File "${file.name}" is not a valid image. Only JPEG, PNG, or GIF files are allowed.`,
          status: 400,
        } as ValidationError;
      }

      // Check file size (5 MB max, 15 MB for GIFs)
      const maxSize =
        file.type === "image/gif" ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw {
          message: `Image file "${file.name}" exceeds the maximum size of ${maxSize / (1024 * 1024)} MB.`,
          status: 400,
        } as ValidationError;
      }
    }
  } else if (mediaType === "video") {
    // Quantity limit: 1 video max
    if (media.length > 1) {
      throw {
        message: "Only one video can be uploaded per post.",
        status: 400,
      } as ValidationError;
    }

    // Validate the single video file
    const file = media[0];
    const validVideoTypes = ["video/mp4"];
    if (!validVideoTypes.includes(file.type)) {
      throw {
        message: `File "${file.name}" is not a valid video. Only MP4 files are allowed.`,
        status: 400,
      } as ValidationError;
    }

    //TODO: Uncomment the following code after implementing the Instagram API
    // Check file size (100 MB max, Instagram's limit)
    // if (file.size > 100 * 1024 * 1024) {
    //   throw {
    //     message: `Video file "${file.name}" exceeds the maximum size of 100 MB.`,
    //     status: 400,
    //   } as ValidationError;
    // }
  }
}

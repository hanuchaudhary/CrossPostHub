import type { Platform } from "@/lib/types";

export const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime";
const megabytes = 1024 * 1024;
export function validateAttachments(
  files: readonly File[]
): string | undefined {
  if (files.length > 4) return "Choose up to 4 photos or one video.";
  for (const file of files) {
    if (!MEDIA_ACCEPT.split(",").includes(file.type))
      return `${file.name}: choose a JPEG, PNG, WebP, GIF, MP4 or MOV file.`;
    const limit = file.type.startsWith("video/")
      ? 200
      : file.type === "image/gif"
        ? 15
        : 10;
    if (!file.size || file.size > limit * megabytes)
      return `${file.name}: the file must be between 1 byte and ${limit} MB.`;
  }
  if (files.length > 1 && files.some((file) => file.type.startsWith("video/")))
    return "Publish a video on its own. Remove the other attachments or customize media per platform.";
}
export function validatePlatformMedia(
  provider: Platform,
  files: readonly File[]
): string | undefined {
  const error = validateAttachments(files);
  if (error) return error;
  if (provider === "instagram") {
    if (!files.length) return "Instagram needs a photo or video.";
    if (
      files.some(
        (file) =>
          !["image/jpeg", "video/mp4", "video/quicktime"].includes(file.type)
      )
    )
      return "Instagram supports JPEG photos and MP4/MOV videos. Choose compatible media or customize this platform.";
    if (
      files.some(
        (file) => file.type === "image/jpeg" && file.size > 8 * megabytes
      )
    )
      return "Instagram photos must be under 8 MB.";
  }
  if (
    provider === "linkedin" &&
    files.some((file) => ["image/webp", "video/quicktime"].includes(file.type))
  )
    return "LinkedIn supports JPEG, PNG, GIF and MP4. Choose compatible media or customize this platform.";
  if (provider === "twitter") {
    if (files.some((file) => file.type === "video/quicktime"))
      return "X videos must be MP4.";
    if (
      files.some(
        (file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
          file.size > 5 * megabytes
      )
    )
      return "X photos must be under 5 MB each.";
    if (files.length > 1 && files.some((file) => file.type === "image/gif"))
      return "X supports a single GIF or up to 4 still photos. Publish the GIF on its own.";
  }
}

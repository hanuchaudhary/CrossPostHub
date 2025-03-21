import { fileTypeFromBuffer } from "file-type";

export async function getTwitterFileType(buffer: Buffer): Promise<string> {
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new Error("File type not found");
  }

  const { mime } = fileType;

  if (mime.startsWith("image/")) {
    if (mime === "image/gif") {
      return "tweet_gif";
    }
    return "tweet_image";
  }

  if (mime.startsWith("video/")) {
    return "tweet_video";
  }

  throw new Error("Invalid file type " + mime);
}

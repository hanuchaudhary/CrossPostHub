import { fileTypeFromBuffer } from "file-type";

export enum TwiiterFileType {
  TWEET_IMAGE = "tweet_image",
  TWEET_GIF = "tweet_gif",
  TWEET_VIDEO = "tweet_video",
}

export async function getTwitterFileType(
  buffer: Buffer
): Promise<TwiiterFileType> {
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new Error("File type not found");
  }

  const { mime } = fileType;

  if (mime.startsWith("image/")) {
    if (mime === "image/gif") {
      return TwiiterFileType.TWEET_GIF;
    }
    return TwiiterFileType.TWEET_IMAGE;
  }

  if (mime.startsWith("video/")) {
    return TwiiterFileType.TWEET_VIDEO;
  }

  throw new Error("Invalid file type " + mime);
}

export async function getLinkedInFileType(buffer: Buffer): Promise<string> {
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new Error("File type not found");
  }

  const { mime } = fileType;

  if (mime.startsWith("image/")) {
    return "IMAGE";
  }

  if (mime.startsWith("video/")) {
    return "VIDEO";
  }

  throw new Error("Invalid file type " + mime);
}

export async function getMimeType(buffer: Buffer) {
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new Error("File type not found");
  }

  const { mime } = fileType;
  console.log("MIME: ", mime);
  return mime;
}

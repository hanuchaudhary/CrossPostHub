import axios, { AxiosError } from "axios";
import { fileTypeFromBuffer } from "file-type";
import { getMimeType } from "../getFileType";

export class LinkedinUtilsV2 {
  private readonly apiBaseUrl = "https://api.linkedin.com/v2";
  private readonly accessToken: string;
  private readonly personURN: string;
  private readonly chunkSize = 5 * 1024 * 1024; // Default chunk size: 5MB

  constructor(accessToken: string, personURN: string) {
    this.accessToken = accessToken;
    this.personURN = personURN;
  }

  private async getFileType(
    media: Buffer
  ): Promise<"feedshare-image" | "feedshare-video"> {
    const fileType = await fileTypeFromBuffer(media);
    if (!fileType) {
      throw new Error("File type not found");
    }

    const { mime } = fileType;

    if (mime.startsWith("image/")) {
      return "feedshare-image";
    } else if (mime.startsWith("video/")) {
      return "feedshare-video";
    }

    throw new Error("Invalid file type " + mime);
  }

  private isFileSizeLarge(fileSize: number): boolean {
    return fileSize > 50 * 1024 * 1024; // 50MB
  }

  // Register media upload

  async registerMediaUpload(media: Buffer) {
    const fileType = await this.getFileType(media);
    console.log("Media Type: " + fileType);

    const response = await axios.post(
      `${this.apiBaseUrl}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          recipes: [`urn:li:digitalmediaRecipe:${fileType}`],
          owner: this.personURN,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Registered response: ", {
      uploadUrl:
        response.data.value.uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl,
      assetURN: response.data.value.asset,
    });

    console.log(fileType + "Media Upload Registered!" + response.data);
    return {
      uploadUrl:
        response.data.value.uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl,
      assetURN: response.data.value.asset,
    };
  }

  // upload Large media > 50MB
  async uploadLargeMedia(uploadURL: string, mediaFile: Buffer) {
    let segmentStart = 1;
    for (let i = 0; i < mediaFile.length; i += this.chunkSize) {
      const chunk = mediaFile.slice(i, i + this.chunkSize);
      await axios.put(`${uploadURL}?part=${segmentStart}`, chunk, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      console.log(`Uploaded chunk ${segmentStart}`);
      segmentStart++;
    }
  }

  // upload small media < 50MB
  private async uploadSmallFile(uploadUrl: string, fileBuffer: Buffer) {
    console.log("Uploading small file on url: ", uploadUrl);
    try {
      const response = await axios.put(uploadUrl, fileBuffer, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": await getMimeType(fileBuffer),
        },
      });
      console.log("Small file uploaded!", response.data);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error.response?.data) {
          console.log("Error uploading small file: ", error.response.data);
        }
      }
    }
  }

  // Finalize media upload
  async finalizeMediaUpload(uploadUrl: string, media: Buffer) {
    await axios.put(uploadUrl, media, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    console.log("Media Uploaded!");
  }

  // CreatePost
  public async postToLinkedIn(
    assetURNs: string[],
    caption: string,
    mimeType: string
  ) {
    const mediaType = mimeType.startsWith("image/") ? "IMAGE" : "VIDEO";
    const mediaArray = assetURNs.map((asset) => ({
      status: "READY",
      media: asset,
      title: { text: "Uploaded Media" },
    }));
    await axios.post(
      `${this.apiBaseUrl}/ugcPosts`,
      {
        author: this.personURN,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: caption },
            shareMediaCategory: mediaType,
            media: mediaArray,
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      },
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );

    console.log("Media posted successfully!");
  }

  // Main function
  public async uploadMedia(
    fileBuffer: Buffer,
    fileSize: number,
    mimeType: string
  ) {
    const { uploadUrl, assetURN } = await this.registerMediaUpload(fileBuffer);

    if (this.isFileSizeLarge(fileSize)) {
      console.log("Uploading large file...");
      await this.uploadLargeMedia(uploadUrl, fileBuffer);
      await this.finalizeMediaUpload(uploadUrl, fileBuffer);
    } else {
      console.log("Uploading small file...");
      await this.uploadSmallFile(uploadUrl, fileBuffer);
    }

    console.log("Upload completed. Asset:", assetURN);
    return assetURN;
  }
}

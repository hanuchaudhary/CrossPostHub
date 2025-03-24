import axios, { AxiosError } from "axios";
import { fileTypeFromBuffer } from "file-type";
import { getMimeType } from "../getFileType";

export class LinkedinUtilsV2 {
  private readonly apiBaseUrl = "https://api.linkedin.com/v2";
  private readonly accessToken: string;
  private readonly personURN: string;
  private readonly chunkSize = 5 * 1024 * 1024; // 5MB

  constructor(accessToken: string, personURN: string) {
    this.accessToken = accessToken;
    this.personURN = personURN;
  }

  private async getFileType(
    media: Buffer
  ): Promise<"feedshare-image" | "feedshare-video"> {
    const fileType = await fileTypeFromBuffer(media);
    if (!fileType) throw new Error("File type not found");
    return fileType.mime.startsWith("image/")
      ? "feedshare-image"
      : "feedshare-video";
  }

  private isFileSizeLarge(fileSize: number): boolean {
    return fileSize > 30 * 1024 * 1024; // 30MB
  }

  async registerMediaUpload(media: Buffer) {
    const fileType = await this.getFileType(media);
    console.log(`[INFO] Registering media upload: ${fileType}`);

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

    const data = {
      uploadUrl:
        response.data.value.uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl,
      assetURN: response.data.value.asset,
    };
    console.log(`[SUCCESS] Media upload registered. Asset: ${data.assetURN}`);
    return data;
  }

  private async uploadSmallFile(uploadUrl: string, fileBuffer: Buffer) {
    console.log("[INFO] Uploading small file...");
    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": await getMimeType(fileBuffer),
      },
    });
    console.log("[SUCCESS] Small file uploaded!");
  }

  async uploadLargeMedia(uploadURL: string, mediaFile: Buffer) {
    console.log("[INFO] Uploading large file in chunks...");
    for (let start = 0; start < mediaFile.length; start += this.chunkSize) {
      const end = Math.min(start + this.chunkSize, mediaFile.length) - 1;
      const chunk = mediaFile.slice(start, end + 1);
      const contentRange = `bytes ${start}-${end}/${mediaFile.length}`;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await axios.put(uploadURL, chunk, {
            headers: {
              "Content-Type": "application/octet-stream",
              "Content-Range": contentRange,
            },
          });
          console.log(`[SUCCESS] Chunk uploaded: ${start}-${end}`);
          break;
        } catch (error) {
          console.log(`[ERROR] Retrying chunk upload (${attempt}/3)...`);
          if (attempt === 3) throw error;
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }
  }

  async checkProcessingStatus(assetURN: string) {
    console.log("[INFO] Checking processing status...");
    //urn:li:digitalmediaAsset:D5605AQFCHMu-W-M8uw to D5605AQFCHMu-W-M8uw
    const splitURN = assetURN.split(":");
    assetURN = splitURN[splitURN.length - 1];

    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const response = await axios.get(
          `${this.apiBaseUrl}/assets/${assetURN}`,
          {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          }
        );
        if (response.data.status === "ALLOWED") {
          console.log("[SUCCESS] Media processing complete!");
          return;
        }
      } catch (error) {
        console.log("[ERROR] Failed to check status, retrying...");
      }
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5 seconds before retrying
    }
    console.log("[ERROR] Media processing timed out.");
  }

  async uploadMedia(fileBuffer: Buffer, fileSize: number) {
    const { uploadUrl, assetURN } = await this.registerMediaUpload(fileBuffer);
    if (this.isFileSizeLarge(fileSize)) {
      await this.uploadLargeMedia(uploadUrl, fileBuffer);
      await this.checkProcessingStatus(assetURN);
    } else {
      await this.uploadSmallFile(uploadUrl, fileBuffer);
    }
    return assetURN;
  }

  // CreatePost
  public async postToLinkedIn(
    assetURNs: string[],
    caption: string,
    mimeTypes: string[]
  ) {
    const mediaType = mimeTypes.every((m) => m.startsWith("image/"))
      ? "IMAGE"
      : "VIDEO"; // Adjust logic as needed
    const mediaArray = assetURNs.map((asset, index) => ({
      status: "READY",
      media: asset,
      title: { text: `Uploaded Media (${mimeTypes[index]})` },
    }));
    const payload = {
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
    };
    console.log(
      "[INFO] Posting to LinkedIn with payload:",
      JSON.stringify(payload)
    );
    await axios.post(`${this.apiBaseUrl}/ugcPosts`, payload, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    console.log("Media posted successfully!");
  }

  // CreateTextPost
  public async postTextToLinkedIn(text: string) {
    const body = {
      author: this.personURN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };
    await axios.post(`${this.apiBaseUrl}/ugcPosts`, body, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Text posted successfully!");
  }
}

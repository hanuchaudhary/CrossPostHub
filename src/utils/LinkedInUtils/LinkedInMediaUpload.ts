import axios, { AxiosError, AxiosResponse } from "axios";

type InitializeUploadProps = {
  accessToken: string;
  personURN: string;
  fileSizeBytes: number;
};

type FinalizeUploadProps = {
  uploadUrl: string;
  media: Buffer | File;
  chunkSize?: number; // Optional: Specify chunk size for chunked uploads
};

type InitializeUploadResponse = {
  uploadUrl: string;
  assetURN: string;
};

export class LinkedInVideoUploader {
  private readonly apiBaseUrl = "https://api.linkedin.com/v2";

  /**
   * Initializes the video upload and retrieves the upload URL and asset URN.
   */
  async initializeUpload({
    accessToken,
    personURN,
    fileSizeBytes,
  }: InitializeUploadProps): Promise<InitializeUploadResponse> {
    const url = `${this.apiBaseUrl}/videos?action=initializeUpload`;
    const data = {
      initializeUploadRequest: {
        owner: `urn:li:person:${personURN}`,
        fileSizeBytes: fileSizeBytes,
        uploadCaptions: false,
        uploadThumbnail: false,
      },
    };

    try {
      console.log("Initializing video upload...");

      const response: AxiosResponse = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });

      const uploadUrl = response.data.value.uploadInstructions[0].uploadUrl;
      const assetURN = response.data.value.video;

      if (!uploadUrl || !assetURN) {
        throw new Error("Upload URL or asset URN not found in the response.");
      }

      console.log("Video upload initialized successfully.");
      return { uploadUrl, assetURN };
    } catch (error) {
      console.error("Error initializing video upload:", error);
      throw error;
    }
  }

  /**
   * Uploads the video in chunks and finalizes the upload.
   */
  async finalizeUpload({
    uploadUrl,
    media,
    chunkSize = 4 * 1024 * 1024, // Default chunk size: 4MB
  }: FinalizeUploadProps): Promise<void> {
    try {
      console.log("Starting video upload...");

      if (media instanceof Buffer) {
        // Upload the entire file if it's small enough
        if (media.length <= chunkSize) {
          await axios.put(uploadUrl, media, {
            headers: {
              "Content-Type": "application/octet-stream",
            },
          });
          console.log("Video uploaded successfully.");
          return;
        }

        // Upload in chunks for larger files
        for (let start = 0; start < media.length; start += chunkSize) {
          const end = Math.min(start + chunkSize, media.length) - 1;
          const chunk = media.slice(start, end + 1);
          const contentRange = `bytes ${start}-${end}/${media.length}`;
          console.log("Content-Range:", contentRange);

          const maxRetries = 3;
          let retryCount = 0;

          while (retryCount < maxRetries) {
            try {
              await axios.put(uploadUrl, chunk, {
                headers: {
                  "Content-Type": "application/octet-stream",
                  "Content-Range": contentRange,
                },
              });
              console.log(`Uploaded chunk: ${start}-${end}`);
              break; // Success, exit the loop
            } catch (error) {
              retryCount++;
              if (retryCount === maxRetries) {
                throw error; // Re-throw the error after max retries
              }
              console.log(`Retrying chunk upload (attempt ${retryCount})...`);
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
            }
          }
        }
      } else {
        // Handle File object (e.g., from a browser file input)
        if (!(media instanceof File)) {
          throw new Error("Expected media to be a File instance.");
        }
        const fileSize = media.size;
        const chunkReader = new FileReader();

        for (let start = 0; start < fileSize; start += chunkSize) {
          const end = Math.min(start + chunkSize, fileSize) - 1;
          const chunk = media.slice(start, end + 1) as Blob;
          const contentRange = `bytes ${start}-${end}/${fileSize}`;
          console.log("Content-Range:", contentRange);

          const arrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
            chunkReader.onload = () =>
              resolve(chunkReader.result as ArrayBuffer);
            chunkReader.readAsArrayBuffer(chunk);
          });

          const maxRetries = 3;
          let retryCount = 0;

          while (retryCount < maxRetries) {
            try {
              await axios.put(uploadUrl, Buffer.from(arrayBuffer), {
                headers: {
                  "Content-Type": "application/octet-stream",
                  "Content-Range": contentRange,
                },
              });
              console.log(`Uploaded chunk: ${start}-${end}`);
              break; // Success, exit the loop
            } catch (error) {
              retryCount++;
              if (retryCount === maxRetries) {
                throw error; // Re-throw the error after max retries
              }
              console.log(`Retrying chunk upload (attempt ${retryCount})...`);
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
            }
          }
        }
      }

      console.log("Video upload finalized successfully.");
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  }
}

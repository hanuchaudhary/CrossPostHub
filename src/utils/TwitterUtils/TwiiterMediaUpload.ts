import OAuth from "oauth-1.0a";
import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";

// Twitter media upload class for uploading large media files in chunks

export class TwitterMediaUpload {
  private oauth: OAuth;
  private oauthToken: string;
  private oauthTokenSecret: string;

  constructor(oauthToken: string, oauthTokenSecret: string) {
    this.oauthToken = oauthToken;
    this.oauthTokenSecret = oauthTokenSecret;

    this.oauth = new OAuth({
      consumer: {
        key: process.env.TWITTER_CONSUMER_KEY!,
        secret: process.env.TWITTER_CONSUMER_SECRET!,
      },
      signature_method: "HMAC-SHA1",
      hash_function: (base_string, key) => {
        return crypto
          .createHmac("sha1", key)
          .update(base_string)
          .digest("base64");
      },
    });

    //init upload function
  }
  async initilizeUpload(
    totalBytes: number,
    mediaType: string,
    mediaCategory?: string
  ) {
    const requestData = {
      url: "https://upload.twitter.com/1.1/media/upload.json",
      method: "POST",
      data: {
        command: "INIT",
        total_bytes: totalBytes,
        media_type: mediaType,
        media_category: mediaCategory,
      },
    };

    const headers = this.oauth.toHeader(
      this.oauth.authorize(
        {
          url: requestData.url,
          method: requestData.method,
          data: requestData.data,
        },
        {
          key: this.oauthToken,
          secret: this.oauthTokenSecret,
        }
      )
    );

    console.log("Init upload headers:", headers);

    try {
      const response = await axios.post(requestData.url, null, {
        params: requestData.data,
        headers: {
          Authorization: headers.Authorization,
        },
      });

      console.log("Init upload response:", {
        status: response.status,
        data: response.data,
        mediaId: response.data.media_id,
      });

      return response.data.media_id;
    } catch (error: any) {
      console.error("Error initializing media upload:", error.message);
      console.error("Twitter API response:", error.response?.data || error);
      throw error;
    }
  }

  // Append a media chunk to the upload.

  async appendChunk(mediaId: string, segmentIndex: number, mediaData: Buffer) {
    const requestData = {
      url: "https://upload.twitter.com/1.1/media/upload.json",
      method: "POST",
      data: {
        command: "APPEND",
        media_id: mediaId,
        segment_index: segmentIndex,
      },
    };

    const headers = this.oauth.toHeader(
      this.oauth.authorize(
        {
          url: requestData.url,
          method: requestData.method,
          data: requestData.data,
        },
        {
          key: this.oauthToken,
          secret: this.oauthTokenSecret,
        }
      )
    );

    const formData = new FormData();
    formData.append("media", mediaData);

    try {
      const response = await axios.post(requestData.url, formData, {
        params: requestData.data,
        headers: {
          ...formData.getHeaders(),
          Authorization: headers.Authorization,
        },
      });

      console.log("Append chunk Media: ", {
        response: response.data,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error appending media chunk:", error.message);
      console.error("Twitter API response:", error.response?.data || error);
      throw error;
    }
  }

  /**
   * Finalize the media upload.
   */
  async finalizeUpload(mediaId: string) {
    const requestData = {
      url: "https://upload.twitter.com/1.1/media/upload.json",
      method: "POST",
      data: {
        command: "FINALIZE",
        media_id: mediaId,
      },
    };

    const headers = this.oauth.toHeader(
      this.oauth.authorize(
        {
          url: requestData.url,
          method: requestData.method,
          data: requestData.data,
        },
        {
          key: this.oauthToken,
          secret: this.oauthTokenSecret,
        }
      )
    );

    try {
      const response = await axios.post(requestData.url, null, {
        params: requestData.data,
        headers: {
          Authorization: headers.Authorization,
        },
      });

      console.log("Finalize upload response:", {
        status: response.status,
        data: response.data,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error finalizing media upload:", error.message);
      console.error("Twitter API response:", error.response?.data || error);
      throw error;
    }
  }

  /**
   * Upload a large media file in chunks.
   */
  async uploadLargeMedia(
    media: Buffer,
    mediaType: string,
    mediaCategory?: string
  ) {
    try {
      // Step 1: Initialize the upload
      const mediaId = await this.initilizeUpload(
        media.length,
        mediaType,
        mediaCategory
      );

      if (!mediaId) {
        throw new Error("Failed to initialize media upload.");
      }

      // Step 2: Upload media in chunks
      const chunkSize = 1 * 1024 * 1024; // 1MB
      let segmentIndex = 0;

      for (let i = 0; i < media.length; i += chunkSize) {
        const chunk = media.slice(i, i + chunkSize);
        await this.appendChunk(mediaId, segmentIndex, chunk);
        segmentIndex++;
      }

      // Step 3: Finalize the upload
      const finalResponse = await this.finalizeUpload(mediaId);

      if (!finalResponse) {
        throw new Error("Failed to finalize media upload.");
      }

      return mediaId;
    } catch (error) {
      console.error("Error uploading large media:", error);
      throw error;
    }
  }
}

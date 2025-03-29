import OAuth from "oauth-1.0a";
import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";
import { getTwitterFileType, TwiiterFileType } from "../getFileType";

export class TwitterUtilsV2 {
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
  }

  //Initialize the media upload
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

    console.log("Initilizing media upload...");

    try {
      const response = await axios.post(requestData.url, null, {
        params: requestData.data,
        headers: {
          Authorization: headers.Authorization,
        },
      });

      console.log("Init upload response: ", response.data.media_id_string);

      return response.data.media_id_string;
    } catch (error: any) {
      console.error("Error initializing media upload:", error.message);
      console.error("Twitter API response:", error.response?.data || error);
      throw error;
    }
  }

  //Append a media chunk to the upload.
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

      console.log("Media chunk appended successfully:", segmentIndex);
      return response.data;
    } catch (error: any) {
      console.error("Error appending media chunk:", error.message);
      console.error("Twitter API response:", error.response?.data || error);
      throw error;
    }
  }

  //Finalize the media upload.
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

    console.log("Finalizing media upload...");

    try {
      const response = await axios.post(requestData.url, null, {
        params: requestData.data,
        headers: {
          Authorization: headers.Authorization,
        },
      });

      console.log("Media upload finalized successfully:", mediaId);

      return response.data;
    } catch (error: any) {
      console.error("Error finalizing media upload:", error.message);
      console.error("Twitter API response:", error.response?.data || error);
      throw error;
    }
  }

  /**
    Check the status of the media upload.
    Example response:

    Media status: {
      media_id: 1903445365040480300,
      media_id_string: '1903445365040480256',
      media_key: '7_1903445365040480256',
      processing_info: { state: 'in_progress', check_after_secs: 1, progress_percent: 20 }
    }

*/

  async checkMediaStatus(mediaId: string) {
    const requestData = {
      url: "https://upload.twitter.com/1.1/media/upload.json",
      method: "GET",
      data: {
        command: "STATUS",
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

    const response = await axios.get(requestData.url, {
      params: requestData.data,
      headers: {
        Authorization: headers.Authorization,
      },
    });

    console.log("Media status:", response.data.processing_info);

    return response.data;
  }

  // Poll the media status until it is ready.
  async pollMediaStatus(mediaId: string) {
    let status: any;
    do {
      status = await this.checkMediaStatus(mediaId);

      if (status.processing_info?.state === "failed") {
        throw new Error(
          `Media processing failed: ${status.processing_info.error?.message}`
        );
      }

      if (status.processing_info?.state !== "succeeded") {
        console.log(
          `Media ${mediaId} is still processing. Current state: ${status.processing_info?.state}`
        );
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            status.processing_info?.check_after_secs * 1000 || 1000
          )
        );
      }
    } while (status.processing_info?.state !== "succeeded");

    console.log("Media processing complete:", mediaId);

    return status;
  }

  // Main function for uploading large media files.
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

      // Step 4: Poll media status until processing is complete
      if (mediaCategory === "tweet_video") {
        console.log("Polling media status for video...");
        await this.pollMediaStatus(mediaId);
      }

      console.log("Media uploaded successfully:", mediaId);

      return mediaId;
    } catch (error) {
      console.error("Error uploading large media:", error);
      throw error;
    }
  }

  async createTweet({ text, mediaIds }: { text: string; mediaIds: string[] }) {
    const requestData = {
      url: "https://api.twitter.com/2/tweets",
      method: "POST",
      data: {
        text,
        ...(mediaIds.length > 0 && { media: { media_ids: mediaIds } }),
      },
    };

    if (!text && mediaIds.length === 0) {
      console.error("Text or media is required to create a tweet");
      return null;
    }

    const headers = this.oauth.toHeader(
      this.oauth.authorize(
        {
          url: requestData.url,
          method: requestData.method,
        },
        {
          key: this.oauthToken,
          secret: this.oauthTokenSecret,
        }
      )
    );

    try {
      console.log("Creating tweet...");
      const response = await axios.post(requestData.url, requestData.data, {
        headers: {
          Authorization: headers.Authorization,
          "Content-Type": "application/json",
          "User-Agent": "PostmanRuntime/7.43.0",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
        },
      });
      console.log("Tweet created successfully");

      return response.data;
    } catch (error: any) {
      console.log(error);
      console.error(
        "Tweet creation failed:",
        error.response?.data || error.message
      );
    }
  }
}

export const twitterPostPublish = async (
  text: string,
  twitterAccessToken: string,
  twitterAccessTokenSecret: string,
  mediaBuffers: Buffer[]
) => {
  const twitterUtils = new TwitterUtilsV2(
    twitterAccessToken,
    twitterAccessTokenSecret
  );
  let mediaIds: string[] = [];
  if (mediaBuffers.length > 0) {
    console.log(`Uploading ${mediaBuffers.length} media files to Twitter...`);

    // Determine media types
    const mediaTypes = await Promise.all(
      mediaBuffers.map(async (mediaBuffer) => getTwitterFileType(mediaBuffer))
    );

    for (let i = 0; i < mediaBuffers.length; i++) {
      const mediaBuffer = mediaBuffers[i];
      const mediaType = mediaTypes[i];

      const mediaCategory =
        mediaType === TwiiterFileType.TWEET_VIDEO
          ? "tweet_video"
          : "tweet_image";

      const mediaId = await twitterUtils.uploadLargeMedia(
        mediaBuffer,
        mediaType === TwiiterFileType.TWEET_VIDEO ? "video/mp4" : "image/jpeg",
        mediaCategory
      );

      console.log(`Media uploaded: ${mediaId}`);
      mediaIds.push(mediaId);
    }
  }

  if (!mediaIds) {
    throw new Error("Failed to upload media to Twitter.");
  }

  const createPostResponse = await twitterUtils.createTweet({ mediaIds, text });

  return createPostResponse;
};

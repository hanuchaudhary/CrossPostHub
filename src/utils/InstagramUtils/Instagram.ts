import axios from "axios";
import FormData from "form-data";

export class InstagramUtils {
  private accessToken: string;
  private igUserId: string;
  private baseUrl: string = "https://graph.facebook.com/v20.0"; // Use the latest API version

  constructor(accessToken: string, igUserId: string) {
    this.accessToken = accessToken;
    this.igUserId = igUserId;
  }

  // Create a media container for an image or video
  async createMediaContainer({
    mediaUrl,
    caption,
    mediaType,
    isReel = false,
  }: {
    mediaUrl: string;
    caption?: string;
    mediaType: "IMAGE" | "VIDEO" | "REELS";
    isReel?: boolean;
  }) {
    const requestData = {
      url: `${this.baseUrl}/${this.igUserId}/media`,
      method: "POST",
      data: {
        [mediaType === "IMAGE" ? "image_url" : "video_url"]: mediaUrl,
        caption: caption || "",
        access_token: this.accessToken,
        ...(mediaType === "REELS" && { media_type: "REELS" }),
      },
    };

    console.log(`Creating media container for ${mediaType}...`);

    try {
      const response = await axios.post(requestData.url, null, {
        params: requestData.data,
      });

      const containerId = response.data.id;
      console.log(`Media container created: ${containerId}`);
      return containerId;
    } catch (error: any) {
      console.error("Error creating media container:", error.message);
      console.error("Instagram API response:", error.response?.data || error);
      throw error;
    }
  }

  // Publish the media container
  async publishMedia(containerId: string) {
    const requestData = {
      url: `${this.baseUrl}/${this.igUserId}/media_publish`,
      method: "POST",
      data: {
        creation_id: containerId,
        access_token: this.accessToken,
      },
    };

    console.log(`Publishing media container: ${containerId}...`);

    try {
      const response = await axios.post(requestData.url, null, {
        params: requestData.data,
      });

      const mediaId = response.data.id;
      console.log(`Media published successfully: ${mediaId}`);
      return mediaId;
    } catch (error: any) {
      console.error("Error publishing media:", error.message);
      console.error("Instagram API response:", error.response?.data || error);
      throw error;
    }
  }

  // Check the status of a video/Reel upload
  async checkMediaStatus(mediaId: string) {
    const requestData = {
      url: `${this.baseUrl}/${mediaId}`,
      method: "GET",
      params: {
        fields: "status,status_code",
        access_token: this.accessToken,
      },
    };

    try {
      const response = await axios.get(requestData.url, {
        params: requestData.params,
      });

      console.log("Media status:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error checking media status:", error.message);
      console.error("Instagram API response:", error.response?.data || error);
      throw error;
    }
  }

  // Poll the media status until it is ready (for videos/Reels)
  async pollMediaStatus(mediaId: string) {
    let status: any;
    do {
      status = await this.checkMediaStatus(mediaId);

      if (status.status_code === "ERROR") {
        throw new Error(`Media processing failed: ${status.status}`);
      }

      if (status.status_code !== "FINISHED") {
        console.log(
          `Media ${mediaId} is still processing. Current status: ${status.status_code}`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    } while (status.status_code !== "FINISHED");

    console.log("Media processing complete:", mediaId);
    return status;
  }

  // Main function for uploading and publishing media
  async uploadAndPublishMedia({
    mediaUrl,
    caption,
    mediaType,
    isReel = false,
  }: {
    mediaUrl: string;
    caption?: string;
    mediaType: "IMAGE" | "VIDEO" | "REELS";
    isReel?: boolean;
  }) {
    try {
      // Step 1: Create media container
      const containerId = await this.createMediaContainer({
        mediaUrl,
        caption,
        mediaType,
        isReel,
      });

      if (!containerId) {
        throw new Error("Failed to create media container.");
      }

      // Step 2: For videos/Reels, poll status until ready
      if (mediaType === "VIDEO" || mediaType === "REELS") {
        console.log("Polling media status for video/Reel...");
        await this.pollMediaStatus(containerId);
      }

      // Step 3: Publish the media
      const mediaId = await this.publishMedia(containerId);

      console.log("Media uploaded and published successfully:", mediaId);
      return mediaId;
    } catch (error) {
      console.error("Error uploading and publishing media:", error);
      throw error;
    }
  }

  // Create a post with multiple media items (carousel)
  async createCarousel({
    mediaItems,
    caption,
  }: {
    mediaItems: { mediaUrl: string; mediaType: "IMAGE" | "VIDEO" }[];
    caption?: string;
  }) {
    try {
      // Step 1: Create containers for each media item
      const children = await Promise.all(
        mediaItems.map(async (item) => {
          const containerId = await this.createMediaContainer({
            mediaUrl: item.mediaUrl,
            mediaType: item.mediaType,
          });
          return containerId;
        })
      );

      // Step 2: Create a carousel container
      const carouselContainer = await this.createMediaContainer({
        mediaType: "CAROUSEL",
        mediaUrl: "", // No URL needed for carousel
        caption,
        children,
      });

      // Step 3: Publish the carousel
      const mediaId = await this.publishMedia(carouselContainer);

      console.log("Carousel published successfully:", mediaId);
      return mediaId;
    } catch (error) {
      console.error("Error creating carousel:", error);
      throw error;
    }
  }
}

export const instagramPostPublish = async (
  mediaUrls: string[],
  caption: string,
  accessToken: string,
  igUserId: string,
  mediaType: "IMAGE" | "VIDEO" | "REELS" | "CAROUSEL" = "IMAGE"
) => {
  const instagramUtils = new InstagramUtils(accessToken, igUserId);

  try {
    if (mediaType === "CAROUSEL") {
      const mediaItems = mediaUrls.map((url) => ({
        mediaUrl: url,
        mediaType: "IMAGE" as "IMAGE" | "VIDEO", // Carousels support images and videos
      }));
      const carouselResponse = await instagramUtils.createCarousel({
        mediaItems,
        caption,
      });
      return carouselResponse;
    }

    console.log(`Uploading ${mediaUrls.length} media files to Instagram...`);

    const mediaIds: string[] = [];
    for (const mediaUrl of mediaUrls) {
      const mediaId = await instagramUtils.uploadAndPublishMedia({
        mediaUrl,
        caption,
        mediaType,
        isReel: mediaType === "REELS",
      });
      mediaIds.push(mediaId);
    }

    return mediaIds;
  } catch (error) {
    console.error("Failed to publish Instagram post:", error);
    throw error;
  }
};
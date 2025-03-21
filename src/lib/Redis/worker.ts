import { Worker, Queue, Job } from "bullmq";
import {
  CreatePostWithMedia,
  CreateTextPost,
  registerAndUploadMedia,
} from "@/utils/LinkedInUtils/LinkedinUtils";
import { createTweet } from "@/utils/TwitterUtils/TwitterUtils";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { getTwitterFileType } from "../getFileType";
import { TwitterMediaUpload } from "@/utils/TwitterUtils/TwiiterMediaUpload";

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD,
};

// Queue instance
export const postQueue = new Queue("postQueue", { connection });

const PublishPostWorker = new Worker(
  "postQueue",
  async (job: Job) => {
    try {
      const { provider, postText, images, userId } = job.data;

      console.log("Processing Job:", {
        provider,
        postText,
        imagesCount: images.length,
        userId,
      });

      // Fetch user data
      const loggedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!loggedUser) {
        throw new Error("User not found.");
      }

      // Convert base64 images to buffers
      const imageBuffers = images.map((imageBase64: string) =>
        Buffer.from(imageBase64, "base64")
      );

      if (provider === "linkedin") {
        const linkedinAccount = loggedUser.accounts.find(
          (acc: { provider: string }) => acc.provider === "linkedin"
        );
        if (!linkedinAccount) {
          throw new Error("LinkedIn account not found.");
        }
        if (!linkedinAccount.access_token) {
          throw new Error("LinkedIn access token is missing.");
        }

        let assetURNs: string[] = [];
        if (imageBuffers.length > 0) {
          console.log(
            `Uploading ${imageBuffers.length} media files to LinkedIn...`
          );
          assetURNs = await Promise.all(
            imageBuffers.map(async (imageBuffer: Buffer) => {
              const assetURN = await registerAndUploadMedia({
                accessToken: linkedinAccount.access_token!,
                personURN: linkedinAccount.providerAccountId!,
                image: imageBuffer,
              });
              console.log(`Media uploaded: ${assetURN}`);
              return assetURN;
            })
          );
        }

        const postResponse =
          imageBuffers.length > 0
            ? await CreatePostWithMedia({
                accessToken: linkedinAccount.access_token!,
                personURN: linkedinAccount.providerAccountId!,
                assetURNs,
                text: postText,
              })
            : await CreateTextPost({
                accessToken: linkedinAccount.access_token!,
                personURN: linkedinAccount.providerAccountId!,
                text: postText,
              });

        if (postResponse.error) {
          throw new Error(postResponse.error);
        }

        // Send success notification
        const notification = await createNotification({
          userId,
          type: "POST_STATUS",
          message: `Your post has been published on ${provider}.`,
        });

        // Trigger SSE event
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, notification }),
        });

        return { provider: "linkedin", response: postResponse };
      }

      if (provider === "twitter") {
        const twitterAccount = loggedUser.accounts.find(
          (acc: { provider: string }) => acc.provider === "twitter"
        );
        if (!twitterAccount) {
          throw new Error("Twitter account not found.");
        }

        const twitterUpload = new TwitterMediaUpload(
          twitterAccount.access_token!,
          twitterAccount.access_token_secret!
        );

        console.log("Uploading media to Twitter... Large media upload");

        let mediaIds: string[] = [];

        if (imageBuffers.length > 0) {
          console.log(
            `Uploading ${imageBuffers.length} media files to Twitter...`
          );

          mediaIds = await Promise.all(
            imageBuffers.map(async (imageBuffer: Buffer) => {
              const mediaCategory = await getTwitterFileType(imageBuffer);
              const mediaType =
                mediaCategory === "tweet_image" ? "image/jpeg" : "video/mp4";

              const mediaId = await twitterUpload.uploadLargeMedia(
                imageBuffer,
                mediaType,
                mediaCategory
              );
              console.log(`Media uploaded: ${mediaId}`);
              return mediaId;
            })
          );
        }

        if (!mediaIds) {
          throw new Error("Failed to upload media to Twitter.");
        }

        const tweetResponse = await createTweet({
          text: postText,
          mediaIds,
          oauth_token: twitterAccount.access_token!,
          oauth_token_secret: twitterAccount.access_token_secret!,
        });

        if (tweetResponse.error) {
          throw new Error(tweetResponse.error);
        }

        // Send success notification
        const notification = await createNotification({
          userId,
          type: "POST_STATUS",
          message: `Your post has been published on ${provider}.`,
        });

        // Trigger SSE event
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, notification }),
        });

        return { provider: "twitter", response: tweetResponse };
      }

      throw new Error(
        `Unsupported provider: ${provider}. Supported providers are 'linkedin' and 'twitter'.`
      );
    } catch (error) {
      console.error(`Job failed for provider: ${job.data.provider}`, error);

      // Send failure notification
      const notification = await createNotification({
        userId: job.data.userId,
        type: "POST_STATUS",
        message: `Failed to publish post on ${job.data.provider}.`,
      });

      // Trigger SSE event
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: job.data.userId, notification }),
      });

      throw error;
    }
  },
  { connection }
);


/**
 * @file worker.ts
 * 
 * This file contains the implementation of a BullMQ worker for processing post publishing jobs
 * to social media platforms such as LinkedIn and Twitter. The worker handles job processing,
 * including media uploads, post creation, database updates, and notifications.
 * 
 * **Note:** This file is currently not in use because the application has transitioned to using 
 * QStash for queue management. The decision to use QStash was made due to development limitations 
 * on Vercel, as Vercel runs on edge infrastructure which does not support long-running processes 
 * like BullMQ workers. 
 * 
 * If the application is deployed on an EC2 instance or any other environment that supports 
 * long-running processes, this file can be revisited and utilized for queue management.
 * 
 * Current file used for posting is `/api/post/route.ts` and `/api/post/process/route.ts`.
 * 
 * @module worker
 */


import { Worker, Queue, Job } from "bullmq";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { TwitterUtilsV2 } from "@/utils/TwitterUtils/TwitterUtillsV2";
import {
  getMimeType,
  getTwitterFileType,
  TwiiterFileType,
} from "@/utils/getFileType";
import { LinkedinUtilsV2 } from "@/utils/LinkedInUtils/LinkedinUtilsV2";
import { sendEmailNotification } from "@/utils/Notifications/Notfications";
import { postSaveToDB } from "@/utils/Controllers/PostSaveToDb";

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD,
  tls: { rejectUnauthorized: false },
};

// Queue instance
export const postQueue = new Queue("postQueue", {
  connection,
});

const publishPostWorker = new Worker(
  "postQueue",
  async (job: Job) => {
    try {
      const { provider, postText, medias, userId } = job.data;

      console.log("Processing Job for provider:", provider);
      // Fetch user data
      const loggedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!loggedUser) {
        throw new Error("User not found.");
      }

      // Convert base64 medias to buffers
      const mediaBuffers = medias.map((imageBase64: string) =>
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

        // let assetURNs: string[] = [];
        // if (mediaBuffers.length > 0) {
        //   console.log(
        //     `Uploading ${mediaBuffers.length} media files to LinkedIn...`
        //   );
        //   assetURNs = await Promise.all(
        //     mediaBuffers.map(async (imageBuffer: Buffer) => {
        //       const assetURN = await registerAndUploadMedia({
        //         accessToken: linkedinAccount.access_token!,
        //         personURN: linkedinAccount.providerAccountId!,
        //         image: imageBuffer,
        //       });
        //       console.log(`Media uploaded: ${assetURN}`);
        //       return assetURN;
        //     })
        //   );
        // }

        // const postResponse =
        //   mediaBuffers.length > 0
        //     ? await CreatePostWithMedia({
        //         accessToken: linkedinAccount.access_token!,
        //         personURN: linkedinAccount.providerAccountId!,
        //         assetURNs,
        //         text: postText,
        //       })
        //     : await CreateTextPost({
        //         accessToken: linkedinAccount.access_token!,
        //         personURN: linkedinAccount.providerAccountId!,
        //         text: postText,
        //       });

        // New LinkedIn post publish
        const postResponse = await linkedinPostPublish(
          postText,
          linkedinAccount.access_token!,
          linkedinAccount.providerAccountId!,
          mediaBuffers
        );

        // Save post to database
        await postSaveToDB({
          postText,
          userId,
          provider,
          status: "SUCCESS",
        });

        // Send success notification
        const notification = await createNotification({
          userId,
          type: "POST_STATUS_SUCCESS",
          message: `Your post has been published on ${provider}.`,
        });
        console.log("Notification Saved to database");

        // Email notification
        const res = await sendEmailNotification(loggedUser.email, {
          username: loggedUser.name!,
          type: "SUCCESS",
          platform: provider,
          postTitle: postText,
        });
        console.log("Email Sent", res?.data);

        return { provider: "linkedin", response: postResponse };
      }

      if (provider === "twitter") {
        const twitterAccount = loggedUser.accounts.find(
          (acc: { provider: string }) => acc.provider === "twitter"
        );
        if (!twitterAccount) {
          throw new Error("Twitter account not found.");
        }

        const tweetResponse = await twitterPostPublish(
          postText,
          twitterAccount.access_token!,
          twitterAccount.access_token_secret!,
          mediaBuffers
        );

        if (tweetResponse.error) {
          throw new Error(tweetResponse.error);
        }

        // Save post to database
        await postSaveToDB({
          postText,
          userId,
          provider,
          status: "SUCCESS",
        });

        // Send success notification
        const notification = await createNotification({
          userId,
          type: "POST_STATUS_SUCCESS",
          message: `Your post has been published on ${provider}.`,
        });

        // Email notification
        const res = await sendEmailNotification(loggedUser.email, {
          username: loggedUser.name!,
          type: "SUCCESS",
          platform: provider,
          postTitle: postText,
        });

        return { provider: "twitter", response: tweetResponse };
      }

      throw new Error(
        `Unsupported provider: ${provider}. Supported providers are 'linkedin' and 'twitter'.`
      );
    } catch (error: any) {
      console.error(`Job failed for provider: ${job.data.provider}`, error);

      // Send failure notification
      const notification = await createNotification({
        userId: job.data.userId,
        type: "POST_STATUS_FAILED",
        message: `Failed to publish post on ${job.data.provider}.`,
      });

      await postSaveToDB({
        postText: job.data.postText,
        userId: job.data.userId,
        provider: job.data.provider,
        status: "FAILED",
      });

      // Email notification
      // const res = await sendEmailNotification("", {
      //   username: "",
      //   type: "FAILED",
      //   platform: job.data.provider,
      //   postTitle: job.data.postText,
      //   error: error.message,
      // });


      throw error;
    }
  },
  {
    connection,
    lockDuration: 30000, // 30 seconds
    lockRenewTime: 60000, // 1 minute
    concurrency: 2,
    removeOnComplete: {
      age: 24 * 60 * 60, // 1 day
    },
    removeOnFail: {
      age: 24 * 60 * 60, // 1 day
    },
    settings:{
      backoffStrategy: (attemptsMade: number) => {
        if (attemptsMade > 3) {
          return 0; // No more retries after 3 attempts
        }
        return Math.pow(2, attemptsMade) * 1000; // Exponential backoff
      }
    }
  }
);

publishPostWorker.on("completed", (job) => {
  console.log(`Job completed for provider: ${job.data.provider}`);
});

publishPostWorker.on("failed", (job, err) => {
  console.error(`Job failed for provider: ${job?.data.provider}`, err);
});

publishPostWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

const twitterPostPublish = async (
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

const linkedinPostPublish = async (
  text: string,
  linkedinAccessToken: string,
  linkedinPersonURN: string,
  mediaBuffers: Buffer[]
) => {
  const linkedinUtils = new LinkedinUtilsV2(
    linkedinAccessToken,
    `urn:li:person:${linkedinPersonURN}`
  );

  if (mediaBuffers.length === 0) {
    console.log("Posting text to LinkedIn...");
    await linkedinUtils.postTextToLinkedIn(text);
    return { message: "Text posted successfully" };
  }

  console.log(`Uploading ${mediaBuffers.length} media files to LinkedIn...`);
  let assetURNs: string[] = [];
  try {
    assetURNs = await Promise.all(
      mediaBuffers.map(async (imageBuffer: Buffer, index: number) => {
        console.log(
          `[INFO] Uploading media ${index + 1}/${mediaBuffers.length}...`
        );
        const assetURN = await linkedinUtils.uploadMedia(
          imageBuffer,
          imageBuffer.length
        );
        console.log(`Media uploaded: ${assetURN}`);
        return assetURN;
      })
    );
  } catch (error: any) {
    console.error("[ERROR] Failed to upload media:", error);
    throw new Error(`Media upload failed: ${error.message}`);
  }

  console.log("Asset URNs:", assetURNs);
  const mimeTypes = await Promise.all(
    mediaBuffers.map((buffer) => getMimeType(buffer))
  );
  console.log("MIME types:", mimeTypes);

  const postResponse = await linkedinUtils.postToLinkedIn(
    assetURNs,
    text,
    mimeTypes
  );

  return { postResponse };
};
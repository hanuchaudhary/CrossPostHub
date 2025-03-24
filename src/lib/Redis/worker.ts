import { Worker, Queue, Job } from "bullmq";
import {
  CreatePostWithMedia,
  CreateTextPost,
  registerAndUploadMedia,
} from "@/utils/LinkedInUtils/LinkedinUtils";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { TwitterUtilsV2 } from "@/utils/TwitterUtils/TwitterUtillsV2";
import {
  getMimeType,
  getTwitterFileType,
  TwiiterFileType,
} from "@/utils/getFileType";
import { LinkedinUtilsV2 } from "@/utils/LinkedInUtils/LinkedinUtilsV2";

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

        // let assetURNs: string[] = [];
        // if (imageBuffers.length > 0) {
        //   console.log(
        //     `Uploading ${imageBuffers.length} media files to LinkedIn...`
        //   );
        //   assetURNs = await Promise.all(
        //     imageBuffers.map(async (imageBuffer: Buffer) => {
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
        //   imageBuffers.length > 0
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

        const postResponse = await linkedinPostPublish(
          postText,
          linkedinAccount.access_token!,
          linkedinAccount.providerAccountId!,
          imageBuffers
        );

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

        const tweetResponse = await twitterPostPublish(
          postText,
          twitterAccount.access_token!,
          twitterAccount.access_token_secret!,
          imageBuffers
        );

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
  console.log("Publishing post on LinkedIn...");

  let assetURNs: string[] = [];
  if (mediaBuffers.length > 0) {
    console.log(`Uploading ${mediaBuffers.length} media files to LinkedIn...`);
    const linkedinUtils = new LinkedinUtilsV2(
      linkedinAccessToken,
      `urn:li:person:${linkedinPersonURN}`
    );

    assetURNs = await Promise.all(
      mediaBuffers.map(async (imageBuffer: Buffer) => {
        const mineType = await getMimeType(imageBuffer);
        const assetURN = await linkedinUtils.uploadMedia(
          imageBuffer,
          imageBuffer.length,
          mineType
        );
        console.log(`Media uploaded: ${assetURN}`);
        return assetURN;
      })
    );

    console.log("Asset URNs:", assetURNs);

    if (!assetURNs) {
      throw new Error("Failed to upload media to LinkedIn.");
    }

    const postResponse = await linkedinUtils.postToLinkedIn(
      assetURNs,
      text,
      await getMimeType(mediaBuffers[0])
    );

    return postResponse;
  }
};

// V1 Twitter Post Publish
// let mediaIds: string[] = [];
// if (imageBuffers.length > 0) {
//   console.log(
//     `Uploading ${imageBuffers.length} media files to Twitter...`
//   );
//   mediaIds = await Promise.all(
//     imageBuffers.map(async (imageBuffer: Buffer) => {
//       const mediaId = await uploadMediaToTwitter({
//         media: imageBuffer,
//         oauth_token: twitterAccount.access_token!,
//         oauth_token_secret: twitterAccount.access_token_secret!,
//       });
//       console.log(`Media uploaded: ${mediaId}`);
//       return mediaId;
//     })
//   );
// }

// if (!mediaIds) {
//   throw new Error("Failed to upload media to Twitter.");
// }

// const twitterUtils = new TwitterUtilsV2(
//   twitterAccount.access_token!,
//   twitterAccount.access_token_secret!
// );

// for (let i = 0; i < mediaIds.length; i++) {
//   const mediaId = mediaIds[i];
//   await twitterUtils.pollMediaStatus(mediaId);
// }

// console.log("Media IDs:", mediaIds);

// const tweetResponse = await createTweet({
//   text: postText,
//   mediaIds,
//   oauth_token: twitterAccount.access_token!,
//   oauth_token_secret: twitterAccount.access_token_secret!,
// });

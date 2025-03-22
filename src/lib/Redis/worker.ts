import { Worker, Queue, Job } from "bullmq";
import {
  CreatePostWithMedia,
  CreateTextPost,
} from "@/utils/LinkedInUtils/LinkedinUtils";
import {
  createTweet,
  uploadMediaToTwitter,
} from "@/utils/TwitterUtils/TwitterUtils";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";
import {
  getLinkedInFileType,
  getTwitterFileType,
  TwiiterFileType,
} from "../../utils/getFileType";
import { TwitterMediaUpload } from "@/utils/TwitterUtils/TwitterMediaUpload";
import { LinkedInVideoUploader } from "@/utils/LinkedInUtils/LinkedInMediaUpload";

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
    const { provider, postText, images, userId } = job.data;

    console.log("Processing Job:", {
      provider,
      postText,
      imagesCount: images.length,
      userId,
    });

    try {
      // Validate input data
      if (!provider || !postText || !userId) {
        throw new Error("Missing required job data.");
      }

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
        await handleLinkedInPost({
          loggedUser,
          postText,
          imageBuffers,
          userId,
        });
      } else if (provider === "twitter") {
        await handleTwitterPost({
          loggedUser,
          postText,
          imageBuffers,
          userId,
        });
      } else {
        throw new Error(
          `Unsupported provider: ${provider}. Supported providers are 'linkedin' and 'twitter'.`
        );
      }
    } catch (error) {
      console.error(`Job failed for provider: ${provider}`, error);

      // Send failure notification
      const notification = await createNotification({
        userId,
        type: "POST_STATUS",
        message: `Failed to publish post on ${provider}.`,
      });

      // Trigger SSE event
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notification }),
      });

      throw error;
    }
  },
  { connection }
);

// Helper function to handle LinkedIn posts
async function handleLinkedInPost({
  loggedUser,
  postText,
  imageBuffers,
  userId,
}: {
  loggedUser: any;
  postText: string;
  imageBuffers: Buffer[];
  userId: string;
}) {
  const linkedinAccount = loggedUser.accounts.find(
    (acc: { provider: string }) => acc.provider === "linkedin"
  );
  if (!linkedinAccount) {
    throw new Error("LinkedIn account not found.");
  }
  if (!linkedinAccount.access_token) {
    throw new Error("LinkedIn access token is missing.");
  }

  const linkedinUpload = new LinkedInVideoUploader();

  let assetURNs: string[] = [];
  if (imageBuffers.length > 0) {
    console.log(`Uploading ${imageBuffers.length} media files to LinkedIn...`);
    assetURNs = await Promise.all(
      imageBuffers.map(async (imageBuffer: Buffer) => {
        
        const { uploadUrl, assetURN } = await linkedinUpload.initializeUpload({
          accessToken: linkedinAccount.access_token!,
          personURN: linkedinAccount.providerAccountId!,
          fileSizeBytes: imageBuffer.length,
        });

        console.log("Upload URL:", uploadUrl);
        console.log("Asset URN:", assetURN);

        await linkedinUpload.finalizeUpload({
          uploadUrl,
          media: imageBuffer,
        });
        return assetURN;
      })
    );
  }

  if (!assetURNs) {
    throw new Error("Failed to upload media to LinkedIn.");
  }

  const mediaType = await getLinkedInFileType(imageBuffers[0]);

  const postResponse =
    imageBuffers.length > 0
      ? await CreatePostWithMedia({
          accessToken: linkedinAccount.access_token!,
          personURN: linkedinAccount.providerAccountId!,
          assetURNs,
          text: postText,
          mediaType,
        })
      : await CreateTextPost({
          accessToken: linkedinAccount.access_token!,
          personURN: linkedinAccount.providerAccountId!,
          text: postText,
        });

  if (postResponse.error) {
    throw new Error(postResponse.error);
  }

  await sendNotification(userId, "linkedin", true);

  return { provider: "linkedin", response: postResponse };
}

// Helper function to handle Twitter posts
async function handleTwitterPost({
  loggedUser,
  postText,
  imageBuffers,
  userId,
}: {
  loggedUser: any;
  postText: string;
  imageBuffers: Buffer[];
  userId: string;
}) {
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

  console.log("Uploading media to Twitter...");

  // Determine media types
  const mediaTypes = await Promise.all(
    imageBuffers.map(async (imageBuffer) => getTwitterFileType(imageBuffer))
  );

  const videoMediaIds: string[] = [];
  const imageMediaIds: string[] = [];

  for (let i = 0; i < imageBuffers.length; i++) {
    const imageBuffer = imageBuffers[i];
    const mediaType = mediaTypes[i];

    if (mediaType === TwiiterFileType.TWEET_VIDEO) {
      const mediaId = await twitterUpload.uploadLargeMedia(
        imageBuffer,
        "video/mp4",
        "tweet_video"
      );
      console.log(`Video uploaded: ${mediaId}`);
      videoMediaIds.push(mediaId);
    } else if (mediaType === TwiiterFileType.TWEET_IMAGE) {
      const mediaId = await uploadMediaToTwitter({
        media: imageBuffer,
        media_category: "tweet_image",
        oauth_token: twitterAccount.access_token!,
        oauth_token_secret: twitterAccount.access_token_secret!,
      });
      console.log(`Image uploaded: ${mediaId}`);
      imageMediaIds.push(mediaId);
    } else {
      throw new Error(`Unsupported media type: ${mediaType}`);
    }
  }

  const mediaIds = [...videoMediaIds, ...imageMediaIds];

   for (const mediaId of mediaIds) {
     const status = await twitterUpload.checkMediaStatus(mediaId);
     if (status.processing_info?.state !== "succeeded") {
       throw new Error(
         `Media ${mediaId} is not ready. Current state: ${status.processing_info?.state}`
       );
     }
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

  await sendNotification(userId, "twitter", true);

  return { provider: "twitter", response: tweetResponse };
}


async function sendNotification(
  userId: string,
  provider: string,
  success: boolean
) {
  const message = success
    ? `Your post has been published on ${provider}.`
    : `Failed to publish post on ${provider}.`;

  const notification = await createNotification({
    userId,
    type: "POST_STATUS",
    message,
  });

  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, notification }),
  });
}

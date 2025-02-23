import { Worker, Queue, Job } from "bullmq";
import {
  CreatePostWithMedia,
  CreateTextPost,
  registerAndUploadMedia,
} from "@/utils/LinkedInUtils/LinkedinUtils";
import {
  createTweet,
  uploadMediaToTwitter,
} from "@/utils/TwitterUtils/TwitterUtils";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";

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

        return { provider: "linkedin", response: postResponse };
      }

      if (provider === "twitter") {
        const twitterAccount = loggedUser.accounts.find(
          (acc: { provider: string }) => acc.provider === "twitter"
        );
        if (!twitterAccount) {
          throw new Error("Twitter account not found.");
        }

        let mediaIds: string[] = [];
        if (imageBuffers.length > 0) {
          console.log(
            `Uploading ${imageBuffers.length} media files to Twitter...`
          );
          mediaIds = await Promise.all(
            imageBuffers.map(async (imageBuffer: Buffer) => {
              const mediaId = await uploadMediaToTwitter({
                media: imageBuffer,
                oauth_token: twitterAccount.access_token!,
                oauth_token_secret: twitterAccount.access_token_secret!,
              });
              console.log(`Media uploaded: ${mediaId}`);
              return mediaId;
            })
          );
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

        return { provider: "twitter", response: tweetResponse };
      }

      throw new Error(
        `Unsupported provider: ${provider}. Supported providers are 'linkedin' and 'twitter'.`
      );
    } catch (error) {
      console.error(`Job failed for provider: ${job.data.provider}`, error);
      throw error;
    }
  },
  { connection }
);

// Event listener for successful job completion
PublishPostWorker.on("completed", async (job: Job) => {
  console.log(`Job completed successfully:`, {
    jobId: job.id,
    result: job.returnvalue,
  });

  const { userId, provider } = job.data;

  // Send success notification
  await createNotification({
    userId,
      type: "POST_STATUS",
    message: `Your post has been published on ${provider}.`,
  })
});

// Event listener for job failure
PublishPostWorker.on("failed", async (job: Job | undefined, error: Error) => {
  if (job) {
    console.error(`Job failed:`, {
      jobId: job.id,
      error: error.message,
    });

    const { userId, provider } = job.data;

    // Send failure notification
    await createNotification({
      userId,
      type: "POST_STATUS",
      message: `Failed to publish post on ${provider}.`,
    }
    );
  } else {
    console.error("Job failed but job is undefined:", error);
  }
});

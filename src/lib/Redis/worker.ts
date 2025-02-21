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
      const { provider, postText, images, loggedUser } = job.data;

      console.log("Processing Job:", {
        provider,
        postText,
        imagesCount: images.length,
        loggedUserId: loggedUser.id,
      });

      // Convert base64 images to buffers
      const imageBuffers = images.map((imageBase64: string) =>
        Buffer.from(imageBase64, "base64")
      );

      if (provider === "linkedin") {
        const linkedinAccount = loggedUser.accounts.find(
          (acc: { provider: string }) => acc.provider === "linkedin"
        );
        if (!linkedinAccount) throw new Error("LinkedIn account not found.");

        let assetURNs: string[] = [];
        if (imageBuffers.length > 0) {
          assetURNs = await Promise.all(
            imageBuffers.map(async (imageBuffer: Buffer) => {
              const assetURN = await registerAndUploadMedia({
                accessToken: linkedinAccount.access_token!,
                personURN: linkedinAccount.providerAccountId!,
                image: imageBuffer,
              });
              if (!assetURN) throw new Error("Media upload failed");
              return assetURN;
            })
          );
          const postResponse = await CreatePostWithMedia({
            accessToken: linkedinAccount.access_token!,
            personURN: linkedinAccount.providerAccountId!,
            assetURNs,
            text: postText,
          });

          if (postResponse.error) {
            throw new Error(postResponse.error);
          }

          return { provider: "linkedin", response: postResponse };
        } else {
          const postResponse = await CreateTextPost({
            accessToken: linkedinAccount.access_token!,
            personURN: linkedinAccount.providerAccountId!,
            text: postText,
          });

          if (postResponse.error) {
            throw new Error(postResponse.error);
          }

          return { provider: "linkedin", response: postResponse };
        }
      }

      if (provider === "twitter") {
        const twitterAccount = loggedUser.accounts.find(
          (acc: { provider: string }) => acc.provider === "twitter"
        );
        if (!twitterAccount) throw new Error("Twitter account not found.");

        let mediaIds: string[] = [];
        if (imageBuffers.length > 0) {
          mediaIds = await Promise.all(
            imageBuffers.map(async (imageBuffer: Buffer) => {
              const mediaId = await uploadMediaToTwitter({
                media: imageBuffer,
                oauth_token: twitterAccount.access_token!,
                oauth_token_secret: twitterAccount.access_token_secret!,
              });
              if (!mediaId) throw new Error("Media upload failed");
              return mediaId;
            })
          );
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
        } else {
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
PublishPostWorker.on("completed", (job: Job) => {
  console.log(`Job completed successfully:`, {
    jobId: job.id,
    result: job.returnvalue,
  });
});

// Event listener for job failure
PublishPostWorker.on("failed", (job: Job | undefined, error: Error) => {
  if (job) {
    console.error(`Job failed:`, {
      jobId: job.id,
      error: error.message,
    });
  } else {
    console.error("Job failed but job is undefined:", error);
  }
});

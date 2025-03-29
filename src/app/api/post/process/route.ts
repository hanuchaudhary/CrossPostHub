import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { TwitterUtilsV2 } from "@/utils/TwitterUtils/TwitterUtillsV2";
import {
  getMimeType,
  getTwitterFileType,
  TwiiterFileType,
} from "@/utils/getFileType";
import { LinkedinUtilsV2 } from "@/utils/LinkedInUtils/LinkedinUtilsV2";
import {
  sendSSEMessage,
  sendEmailNotification,
} from "@/utils/Notifications/Notfications";
import { postSaveToDB } from "@/utils/Controllers/PostSaveToDb";
import { verifySignature } from "@upstash/qstash/nextjs";
import { NextApiRequest } from "next";

export const POST = verifySignature(async (request: NextApiRequest) => {
  const jobData = await request.body;

  if (!jobData) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }

  const { provider, postText, medias, userId, scheduledFor } = jobData;

  let loggedUser: any;
  try {
    console.log("Processing Job for provider:", provider);

    loggedUser = await prisma.user.findUnique({
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

      const postResponse = await linkedinPostPublish(
        postText,
        linkedinAccount.access_token!,
        linkedinAccount.providerAccountId!,
        mediaBuffers
      );

      await Promise.all([
        postSaveToDB({
          postText,
          userId,
          provider,
          status: "SUCCESS",
        }),
        createNotification({
          userId,
          type: "POST_STATUS",
          message: `Your post has been published on ${provider}.`,
        }).then(async (notification) => {
          await Promise.all([
            sendEmailNotification(loggedUser.email, {
              username: loggedUser.name!,
              type: "SUCCESS",
              platform: provider,
              postTitle: postText,
            }).then((res) => console.log("Email Sent", res?.data)),
            sendSSEMessage(userId, {
              type: "post-success",
              message: notification.message,
            }),
          ]);
        }),
      ]);

      return NextResponse.json({
        provider: "linkedin",
        response: postResponse,
      });
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

      await Promise.all([
        postSaveToDB({
          postText,
          userId,
          provider,
          status: "SUCCESS",
        }),
        createNotification({
          userId,
          type: "POST_STATUS",
          message: `Your post has been published on ${provider}.`,
        }).then(async (notification) => {
          await Promise.all([
            sendEmailNotification(loggedUser.email, {
              username: loggedUser.name!,
              type: "SUCCESS",
              platform: provider,
              postTitle: postText,
            }).then((res) => console.log("Email Sent", res?.data)),
            sendSSEMessage(userId, {
              type: "post-success",
              message: notification.message,
            }),
          ]);
        }),
      ]);

      return NextResponse.json({
        provider: "twitter",
        response: tweetResponse,
      });
    }

    throw new Error(
      `Unsupported provider: ${provider}. Supported providers are 'linkedin' and 'twitter'.`
    );
  } catch (error: any) {
    console.error(`Job failed for provider: ${provider}`, error);

    await Promise.all([
      postSaveToDB({
        postText,
        userId,
        provider,
        status: "FAILED",
      }),
      createNotification({
        userId,
        type: "POST_STATUS",
        message: `Failed to publish post on ${provider}: ${error.message}`,
      }).then(async (notification) => {
        await Promise.all([
          sendEmailNotification(loggedUser?.email || "", {
            username: loggedUser?.name || "User",
            type: "FAILED",
            platform: provider,
            postTitle: postText,
            error: error.message,
          }),
          sendSSEMessage(userId, {
            type: "post-failed",
            message: notification.message,
          }),
        ]);
      }),
    ]);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

async function twitterPostPublish(
  text: string,
  twitterAccessToken: string,
  twitterAccessTokenSecret: string,
  mediaBuffers: Buffer[]
) {
  const twitterUtils = new TwitterUtilsV2(
    twitterAccessToken,
    twitterAccessTokenSecret
  );
  let mediaIds: string[] = [];
  if (mediaBuffers.length > 0) {
    console.log(`Uploading ${mediaBuffers.length} media files to Twitter...`);

    const mediaTypes = await Promise.all(
      mediaBuffers.map(async (mediaBuffer) => getTwitterFileType(mediaBuffer))
    );

    mediaIds = await Promise.all(
      mediaBuffers.map(async (mediaBuffer, i) => {
        const mediaType = mediaTypes[i];
        const mediaCategory =
          mediaType === TwiiterFileType.TWEET_VIDEO
            ? "tweet_video"
            : "tweet_image";
        const mediaId = await twitterUtils.uploadLargeMedia(
          mediaBuffer,
          mediaType === TwiiterFileType.TWEET_VIDEO
            ? "video/mp4"
            : "image/jpeg",
          mediaCategory
        );
        console.log(`Media uploaded: ${mediaId}`);
        return mediaId;
      })
    );
  }

  if (mediaBuffers.length > 0 && !mediaIds.length) {
    throw new Error("Failed to upload media to Twitter.");
  }

  const createPostResponse = await twitterUtils.createTweet({ mediaIds, text });
  return createPostResponse;
}

async function linkedinPostPublish(
  text: string,
  linkedinAccessToken: string,
  linkedinPersonURN: string,
  mediaBuffers: Buffer[]
) {
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
  const assetURNs = await Promise.all(
    mediaBuffers.map(async (imageBuffer: Buffer, index: number) => {
      console.log(
        `[INFO] Uploading media ${index + 1}/${mediaBuffers.length}...`
      );
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      try {
        const assetURN = await linkedinUtils.uploadMedia(
          imageBuffer,
          imageBuffer.length
        );
        console.log(`Media uploaded: ${assetURN}`);
        return assetURN;
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  const mimeTypes = await Promise.all(
    mediaBuffers.map((buffer) => getMimeType(buffer))
  );
  const postResponse = await linkedinUtils.postToLinkedIn(
    assetURNs,
    text,
    mimeTypes
  );
  return { postResponse };
}

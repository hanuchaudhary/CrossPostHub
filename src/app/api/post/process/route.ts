import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { twitterPostPublish } from "@/utils/TwitterUtils/TwitterUtillsV2";
import { linkedinPostPublish } from "@/utils/LinkedInUtils/LinkedinUtilsV2";
import {
  sendEmailNotification,
} from "@/utils/Notifications/Notfications";
import { postSaveToDB } from "@/utils/Controllers/PostSaveToDb";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendSSEMessage } from "@/utils/Notifications/SSE/sse";
import { decryptToken } from "@/lib/Crypto";

async function handler(request: NextRequest) {
  const jobData = await request.json();

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
     
      if(!linkedinAccount.access_token || !linkedinAccount.access_token_iv) {
        throw new Error("LinkedIn access token not found.");
      }

      // Decrypt the access token 
      const decryptedAccessToken = decryptToken(
        linkedinAccount.access_token_iv,
        linkedinAccount.access_token
      );

      const postResponse = await linkedinPostPublish(
        postText,
        decryptedAccessToken,
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

      if(!twitterAccount.access_token || !twitterAccount.access_token_secret) {
        throw new Error("Twitter access token not found.");
      }

      let decryptedAccessToken = decryptToken(
        twitterAccount.access_token_iv,
        twitterAccount.access_token
      );

      let decryptedAccessTokenSecret = decryptToken(
        twitterAccount.access_token_secret_iv,
        twitterAccount.access_token_secret
      );

      const tweetResponse = await twitterPostPublish(
        postText,
        decryptedAccessToken,
        decryptedAccessTokenSecret,
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
}

export const POST = verifySignatureAppRouter(handler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

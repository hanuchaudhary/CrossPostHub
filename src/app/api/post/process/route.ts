import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { twitterPostPublish } from "@/utils/TwitterUtils/TwitterUtillsV2";
import { linkedinPostPublish } from "@/utils/LinkedInUtils/LinkedinUtilsV2";
import { sendEmailNotification } from "@/utils/Notifications/Notfications";
import { postSaveToDB } from "@/utils/Controllers/PostSaveToDb";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { decryptToken } from "@/lib/Crypto";
import { getFromS3Bucket } from "@/config/s3Config";
import { Client } from "@upstash/qstash";
import { instagramPostPublish } from "@/utils/InstagramUtils/Instagram";

// TODO: send single email to user with all the errors instead of sending multiple emails
const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

async function handler(request: NextRequest) {
  const jobData = await request.json();

  if (!jobData) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }

  const { provider, postText, mediaKeys, userId, postId } = jobData;

  let loggedUser: any;

  try {
    console.log("Processing Job for provider:", provider, "postId:", postId);

    // Fetch the post to check its status
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found.");
    }

    loggedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!loggedUser) {
      throw new Error("User not found.");
    }

    // Convert mediaKeys to buffers
    let mediaBuffers: Buffer[] = [];
    try {
      mediaBuffers = await Promise.all(
        mediaKeys.map(async (key: string) => {
          const buffer = await getFromS3Bucket(key);
          return buffer;
        })
      );
    } catch (error) {
      throw new Error("Failed to retrieve media from S3");
    }

    let postResponse;
    if (provider === "linkedin") {
      const linkedinAccount = loggedUser.accounts.find(
        (acc: { provider: string }) => acc.provider === "linkedin"
      );
      if (!linkedinAccount) {
        throw new Error("LinkedIn account not found.");
      }

      if (!linkedinAccount.access_token || !linkedinAccount.access_token_iv) {
        throw new Error("LinkedIn access token not found.");
      }

      const decryptedAccessToken = decryptToken(
        linkedinAccount.access_token_iv,
        linkedinAccount.access_token
      );

      postResponse = await linkedinPostPublish(
        postText,
        decryptedAccessToken,
        linkedinAccount.providerAccountId!,
        mediaBuffers
      );
    } else if (provider === "twitter") {
      const twitterAccount = loggedUser.accounts.find(
        (acc: { provider: string }) => acc.provider === "twitter"
      );
      if (!twitterAccount) {
        throw new Error("Twitter account not found.");
      }

      if (!twitterAccount.access_token || !twitterAccount.access_token_secret) {
        throw new Error("Twitter access token not found.");
      }

      const decryptedAccessToken = decryptToken(
        twitterAccount.access_token_iv,
        twitterAccount.access_token
      );

      const decryptedAccessTokenSecret = decryptToken(
        twitterAccount.access_token_secret_iv,
        twitterAccount.access_token_secret
      );

      postResponse = await twitterPostPublish(
        postText,
        decryptedAccessToken,
        decryptedAccessTokenSecret,
        mediaBuffers
      );

      if (postResponse.error) {
        throw new Error(postResponse.error);
      }
    } else if (provider === "instagram") {
      const instagramAccount = loggedUser.accounts.find(
        (acc: any) => acc.provider === "instagram"
      );

      if (!instagramAccount) {
        throw new Error("Instagram account not found.");
      }

      try {
        let mediaUrls: any = [];
        mediaUrls = await Promise.all(
          mediaKeys.map(async (key: string) => {
            return `https://crossposthub.s3.ap-south-1.amazonaws.com/media/${loggedUser.id}/${key}`;
          })
        );

        console.log("Media URLs:", mediaUrls);

        const response = await instagramPostPublish(
          mediaUrls,
          postText,
          instagramAccount.access_token,
          instagramAccount.providerAccountId!,
          mediaUrls.length > 1 ? "CAROUSEL" : "IMAGE"
        );
        console.log("Instagram post response:", response);
      } catch (error) {}
    } else {
      throw new Error(
        `Unsupported provider: ${provider}. Supported providers are 'linkedin' and 'twitter'.`
      );
    }

    // Update post status to SUCCESS
    await prisma.post.update({
      where: { id: postId },
      data: { status: "SUCCESS", provider: provider },
    });

    await Promise.all([
      createNotification({
        userId,
        type: "POST_STATUS_SUCCESS",
        message: `Your post has been published on ${provider}.`,
      }).then(async (notification) => {
        await Promise.all([
          sendEmailNotification(loggedUser.email, {
            username: loggedUser.name!,
            type: "SUCCESS",
            platform: provider,
            postTitle: postText,
          }).then((res) => console.log("Email Sent", res?.data)),
        ]);
      }),
    ]);

    // FIXED: DELETED MEDIA FROM S3 AFTER CERTAIN DAYS IN S3 ITSELF ✅
    // await qstashClient.publishJSON({
    //   url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/delete`,
    //   body: {
    //     mediaKeys,
    //   },
    //   delay: 60, // Delay deletion by 60 seconds to ensure all operations are complete
    // });

    return NextResponse.json({
      provider,
      response: postResponse,
    });
  } catch (error: any) {
    console.error(`Job failed for provider: ${provider}`, error);

    // Check if a failure notification already exists for this post and provider
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        type: "POST_STATUS_FAILED",
        message: {
          contains: `Failed to publish post on ${provider}`,
        },
      },
    });

    // Update post status to FAILED with the error message
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "FAILED",
        text: error.message,
        provider: provider,
      },
    });

    // Only send notifications if this is the first failure
    if (!existingNotification) {
      await Promise.all([
        postSaveToDB({
          postText,
          userId,
          provider,
          status: "FAILED",
        }),
        createNotification({
          userId,
          type: "POST_STATUS_FAILED",
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
          ]);
        }),
      ]);
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
import { Providers } from "@/Types/Types";
import { CheckCreatedPostMiddleware } from "@/utils/CheckCreatedPostMiddleware";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { Client } from "@upstash/qstash";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch logged-in user
    const loggedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });
    if (!loggedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check post creation limit
    const result = await CheckCreatedPostMiddleware(loggedUser.id);
    if (!result) {
      return NextResponse.json(
        {
          error: `Post limit reached for the month. Please upgrade your plan to create more posts.`,
        },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const postText = formData.get("postText") as string;
    const mediaKeysJson = formData.get("mediaKeys") as string;
    const mediaKeys = mediaKeysJson ? JSON.parse(mediaKeysJson) : [];
    const scheduleAt = formData.get("scheduleAt") as string;
    const providersJson = formData.get("providers") as string;
    const providers = JSON.parse(providersJson) as Providers[];

    // Validate inputs
    if (providers.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one provider" },
        { status: 400 }
      );
    }
    if (!postText && mediaKeys.length === 0) {
      return NextResponse.json(
        { error: "Please enter some text or upload an image" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        userId: loggedUser.id,
        text: postText,
        status: "PENDING",
        mediaKeys, // Store S3 media keys directly
        scheduledFor: scheduleAt ? new Date(scheduleAt) : null,
      },
    });

    // Initialize QStash client
    const qstashClient = new Client({
      token: process.env.QSTASH_TOKEN!,
    });
    
    // Use ngrok URL for local development
    const URL = process.env.NEXTAUTH_URL;
    if (!URL) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 500 });
    }

    // Add jobs to QStash for each provider
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          const jobData = {
            provider,
            postText,
            mediaKeys, // Send s3 keys instead of base64
            userId: loggedUser.id,
            scheduledFor: scheduleAt || null,
            postId: post.id,
          };

          // Publish the message to QStash
          const publishResponse = await qstashClient.publishJSON({
            url: `${URL}/api/post/process`,
            body: jobData,
            retries: 3,
            delay: scheduleAt
              ? Math.floor((new Date(scheduleAt).getTime() - Date.now()) / 1000) // Delay in seconds
              : undefined,
          });

          // Create a notification for the user
          await createNotification({
            message: `Processing post for ${provider}`,
            type: "POST_STATUS",
            userId: loggedUser.id as string,
          });

          return {
            provider,
            jobId: publishResponse.messageId,
            status: "queued",
            scheduledFor: scheduleAt || null,
          };
        } catch (error: any) {
          console.error(`Failed to add job for provider: ${provider}`, error);
          return { provider, error: error.message, status: "failed" };
        }
      })
    );

    // Format results for response
    const formattedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          provider: result.reason.provider,
          status: "failed",
          error: result.reason.error,
        };
      }
    });

    return NextResponse.json({ results: formattedResults }, { status: 200 });
  } catch (error) {
    console.error("CreatePost Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import prisma from "@/config/prismaConfig";
import SubscriptionMiddleware from "@/utils/SubscriptionMiddleware";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { caption } = await request.json();
    if (!caption) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const middleware = new SubscriptionMiddleware(session.user.id!);
    const imageLimit = await middleware.canGenerateImage();

    if (!imageLimit) {
      return NextResponse.json(
        {
          error: "Image generation limit reached. Please upgrade your plan.",
        },
        { status: 403 }
      );
    }

    if (!caption) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: `Generate an image based on the following caption:  + "${caption}"`,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    if (result.data.images.length === 0) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    await prisma.generatedImage.create({
      data: {
        prompt: caption,
        userId: session.user.id!,
        url: result.data.images[0].url,
      },
    });

    return NextResponse.json(
      {
        images: result.data,
        status: "success",
        message: "Image generated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

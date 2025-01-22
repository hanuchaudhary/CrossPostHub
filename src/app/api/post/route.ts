import prisma from "@/lib/prisma";
import { postQueue } from "@/lib/Redis/queue";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loggedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!loggedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const postText = formData.get("postText") as string;
    const images = formData.getAll("images") as File[];
    const providersJson = formData.get("providers") as string;
    const scheduleAt = formData.get("scheduleAt") as string; // Add scheduleAt field
    const providers = JSON.parse(providersJson);

    console.log({
        postText,
        images,
        providers,
        scheduleAt
    });
    

    if (providers.length === 0) {
      return NextResponse.json({ error: "Please select at least one provider" }, { status: 400 });
    }

    if (!postText && images.length === 0) {
      return NextResponse.json({ error: "Please enter some text or upload an image" }, { status: 400 });
    }

    // Determine if the post is scheduled or instant
    const isScheduled = scheduleAt && new Date(scheduleAt) > new Date();

    const jobs: Promise<void>[] = providers.map((provider: string) =>
        postQueue.add(
            "postQueue",
            { provider, postText, images, loggedUser },
            isScheduled
                ? { delay: new Date(scheduleAt).getTime() - Date.now() }
                : {}
        )
    );
    await Promise.all(jobs);

    const message = isScheduled
      ? "Post scheduled successfully"
      : "Post submitted successfully";

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("CreatePost Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

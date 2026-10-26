import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { deleteFromS3Bucket } from "@/config/s3Config";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { mediaKey } = await request.json();
    if (!mediaKey) {
      return new Response("Invalid mediaKey", { status: 400 });
    }

    await deleteFromS3Bucket(mediaKey);

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Failed to delete media from S3:", error);
    return NextResponse.json(
      { error: "Failed to delete media from S3" },
      { status: 500 }
    );
  }
}

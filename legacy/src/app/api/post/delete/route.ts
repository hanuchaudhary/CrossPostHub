// /api/delete-media.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteFromS3Bucket } from "@/config/s3Config";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

async function handler(request: NextRequest) {
  const { mediaKeys } = await request.json();

  if (!mediaKeys || !Array.isArray(mediaKeys)) {
    return NextResponse.json({ error: "Invalid mediaKeys" }, { status: 400 });
  }

  try {
    await Promise.all(
      mediaKeys.map(async (key: string) => {
        await deleteFromS3Bucket(key);
        console.log(`Deleted media from S3: ${key}`);
      })
    );
    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Failed to delete media from S3:", error);
    return NextResponse.json(
      { error: "Failed to delete media from S3" },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(handler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

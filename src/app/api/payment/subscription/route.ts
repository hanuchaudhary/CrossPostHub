import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: { updatedAt: "desc" }
    });

    if (!subscription) {
      return NextResponse.json({ status: "none" });
    }

    return NextResponse.json({
      status: subscription.status,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}

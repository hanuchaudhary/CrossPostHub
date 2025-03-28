import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
import { getTwitterUserDetails } from "@/utils/TwitterUtils/TwitterUtils";
import { redis } from "@/config/redisConfig";
import { getLinkedInProfile } from "@/utils/LinkedInUtils/LinkedinUtils";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const cacheDashboardDataKey = `dashboardData-${session.user.id}`;
    const cacheDashboardData = await redis.get(cacheDashboardDataKey);
    if (cacheDashboardData) {
      console.log("Cache hit");
      return NextResponse.json(cacheDashboardData, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select:{
        accounts: true,
        posts: {
          select: {
            createdAt: true,
            provider: true,
          },
        },
      },
    });

    const twitterAccount = user?.accounts.find(
      (account) => account.provider === "twitter"
    );

    if (!twitterAccount) {
      return NextResponse.json(
        { error: "Twitter account not found" },
        { status: 404 }
      );
    }

    const twitterUserDetails = await getTwitterUserDetails({
      oauth_token: twitterAccount?.access_token as string,
      oauth_token_secret: twitterAccount?.access_token_secret as string,
    });


    type Provider = "twitter" | "linkedin" | "instagram";

    // Initialize a map to store the aggregated data
    const monthlyData: {
      [key: string]: {
        month: string;
        twitter: number;
        linkedin: number;
        instagram: number;
      };
    } = {};

    // Iterate through the posts and aggregate the data
    user?.posts.forEach((post) => {
      const month = post.createdAt.toLocaleString("default", {
        month: "short",
      });
      const provider = (post.provider!.charAt(0) +
        post.provider!.slice(1)) as Provider;

      if (!monthlyData[month]) {
        monthlyData[month] = { month, twitter: 0, linkedin: 0, instagram: 0 };
      }

      if (monthlyData[month][provider] !== undefined) {
        monthlyData[month][provider] += 1;
      }
    });

    // Convert the map to an array of objects
    const result = Object.values(monthlyData);

    const dashboardData = {
      twitterUserDetails,
      monthlyData: result,
    };

    // Cache the data
    await redis.set(cacheDashboardDataKey, JSON.stringify(dashboardData), {
      ex: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.log("Error in GET /api/user:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

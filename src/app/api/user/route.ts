// pages/api/user.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
import { getTwitterUserDetails } from "@/utils/TwitterUtils/TwitterUtils";
import { redisClient } from "@/config/redisConfig";
import { decryptToken } from "@/lib/Crypto";
import { TwitterUser } from "@/Types/Types";
// import { getLinkedInProfile } from "@/utils/LinkedInUtils/LinkedinUtils";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cacheDashboardDataKey = `dashboardData-${session.user.id}`;
    const cacheDashboardData = await redisClient.get(cacheDashboardDataKey);
    if (cacheDashboardData) {
      console.log("Cache hit", typeof cacheDashboardData);
      return NextResponse.json(cacheDashboardData, { status: 200 });
    }

    // Fetch user data with posts from the last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accounts: true,
        posts: {
          where: {
            createdAt: { gte: oneYearAgo },
            status: "SUCCESS", // Only count successful posts
          },
          select: {
            createdAt: true,
            provider: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch Twitter user details
    const twitterAccount = user.accounts.find(
      (account) => account.provider === "twitter"
    );

    let twitterUserDetails = null;
    let selectedTwitterUserDetails: TwitterUser | null = null;
    if (twitterAccount) {
      const twitterAccessToken = decryptToken(
        twitterAccount.access_token_iv!,
        twitterAccount.access_token!
      );
      const twitterAccessTokenSecret = decryptToken(
        twitterAccount.access_token_secret_iv!,
        twitterAccount.access_token_secret!
      );

      twitterUserDetails = await getTwitterUserDetails({
        oauth_token: twitterAccessToken,
        oauth_token_secret: twitterAccessTokenSecret,
      });

      if (!twitterUserDetails) {
        return NextResponse.json(
          { error: "Failed to fetch Twitter user details" },
          { status: 500 }
        );
      }

      selectedTwitterUserDetails = {
        id: twitterUserDetails.id,
        name: twitterUserDetails.name,
        screen_name: twitterUserDetails.screen_name,
        location: twitterUserDetails.location,
        description: twitterUserDetails.description,
        url: twitterUserDetails.url,
        profile_image_url: twitterUserDetails.profile_image_url,
        followers_count: twitterUserDetails.followers_count,
        friends_count: twitterUserDetails.friends_count,
        createdAt: twitterUserDetails.created_at,
        verified: twitterUserDetails.verified,
        profile_image_url_https: twitterUserDetails.profile_image_url_https,
        profile_banner_url: twitterUserDetails.profile_banner_url,
        profile_background_color: twitterUserDetails.profile_background_color,
      };
    }

    // TODO: FETCH LINKEDIN USER DETAILS

    // const linkedinAccount = user.accounts.find(
    //   (account) => account.provider === "linkedin"
    // );
    // let linkedinUserDetails = null;
    // if (linkedinAccount) {
    //   const linkedinAccessToken = decryptToken(
    //     linkedinAccount.access_token_iv!,
    //     linkedinAccount.access_token!
    //   );
    //   linkedinUserDetails = await getLinkedInProfile(linkedinAccessToken);
    //   if (!linkedinUserDetails) {
    //     return NextResponse.json(
    //       { error: "Failed to fetch LinkedIn user details" },
    //       { status: 500 }
    //     );
    //   }
    // }

    // Define the Provider type to match the schema
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
    user.posts.forEach((post) => {
      const month = post.createdAt.toLocaleString("default", {
        month: "short",
      });

      const provider = post.provider as Provider;

      if (!monthlyData[month]) {
        monthlyData[month] = { month, twitter: 0, linkedin: 0, instagram: 0 };
      }

      // Type-safe property access
      if (provider in monthlyData[month]) {
        monthlyData[month][provider] += 1;
      }
    });

    // Convert the map to an array of objects
    const result = Object.values(monthlyData);

    // Prepare the dashboard data
    const dashboardData = {
      twitterUserDetails: selectedTwitterUserDetails || null,
      // linkedinUserDetails: linkedinUserDetails || null,
      monthlyData: result,
    };

    // Cache the data for 24 hours
    await redisClient.set(
      cacheDashboardDataKey,
      JSON.stringify(dashboardData),
      {
        ex: 24 * 60 * 60, // 24 hours
      }
    );

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch dashboard data: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching dashboard data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { githubUsername } = await request.json();

    const cacheDashboardDataKey = `${githubUsername}-githubProfile`;
    const cacheDashboardData = await redisClient.get(cacheDashboardDataKey);
    if (cacheDashboardData) {
      console.log("Cache hit", typeof cacheDashboardData);
      return NextResponse.json(cacheDashboardData, { status: 200 });
    }

    // Fetch basic GitHub user profile
    const userResult = await fetch(
      `https://api.github.com/users/${githubUsername}`
    );
    const userData = await userResult.json();

    if (!userData) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub data" },
        { status: 500 }
      );
    }

    redisClient.set(cacheDashboardDataKey, JSON.stringify(userData), {
      ex: 3 * 60 * 60, // 3 hour
    });

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/user:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

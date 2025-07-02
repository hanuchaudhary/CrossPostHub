import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
import { redisClient } from "@/config/redisConfig";
import { decryptToken } from "@/lib/Crypto";
import { TwitterUser } from "@/Types/Types";
import { TwitterUtilsV2 } from "@/utils/TwitterUtils/TwitterUtillsV2";
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
      const parsedData =
        typeof cacheDashboardData === "string"
          ? JSON.parse(cacheDashboardData)
          : cacheDashboardData;
      return NextResponse.json(parsedData, { status: 200 });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accounts: true,
        posts: {
          where: {
            createdAt: { gte: oneYearAgo },
            status: "SUCCESS",
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
    const twitterAccount = user.accounts.find(
      (account) => account.provider === "twitter"
    );

    let twitterUserDetails = null;
    let selectedTwitterUserDetails: TwitterUser | null = null;
    if (twitterAccount) {
      try {
        if (
          !twitterAccount.access_token_iv ||
          !twitterAccount.access_token ||
          !twitterAccount.access_token_secret_iv ||
          !twitterAccount.access_token_secret
        ) {
          console.warn(
            "Missing Twitter token fields for user:",
            session.user.id
          );
        } else {
          const twitterAccessToken = decryptToken(
            twitterAccount.access_token_iv,
            twitterAccount.access_token
          );
          const twitterAccessTokenSecret = decryptToken(
            twitterAccount.access_token_secret_iv,
            twitterAccount.access_token_secret
          );

          const twitter = new TwitterUtilsV2(
            twitterAccessToken,
            twitterAccessTokenSecret
          );
          twitterUserDetails = await twitter.getTwitterUserDetails();

          if (twitterUserDetails) {
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
              profile_image_url_https:
                twitterUserDetails.profile_image_url_https,
              profile_banner_url: twitterUserDetails.profile_banner_url,
              profile_background_color:
                twitterUserDetails.profile_background_color,
            };
          }
        }
      } catch (twitterError) {
        console.error("Error fetching Twitter user details:", twitterError);
        }
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
    //   linkedinUserDetails = await getLinkedInProfile(
    //     linkedinAccessToken)
    //   if (!linkedinUserDetails) {
    //     return NextResponse.json(
    //       { error: "Failed to fetch LinkedIn user details" },
    //       { status: 500 }
    //     );
    //   }
    // }

    type Provider = "twitter" | "linkedin" | "instagram";

    const monthlyData: {
      [key: string]: {
        month: string;
        monthIndex: number;
        twitter: number;
        linkedin: number;
        instagram: number;
      };
    } = {};

    user.posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const month = date.toLocaleString("default", {
        month: "short",
      });
      const monthIndex = date.getMonth(); // For proper sorting
      const provider = post.provider as Provider;

      const key = `${date.getFullYear()}-${monthIndex}-${month}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month,
          monthIndex,
          twitter: 0,
          linkedin: 0,
          instagram: 0,
        };
      }

      if (provider in monthlyData[key]) {
        monthlyData[key][provider] += 1;
      }
    });

    const result = Object.values(monthlyData)
      .sort((a, b) => b.monthIndex - a.monthIndex) // Sort by month index descending
      .map(({ monthIndex, ...rest }) => rest); // Remove monthIndex from final result

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
    const body = await request.json();
    const { githubUsername } = body;

    // Input validation
    if (!githubUsername || typeof githubUsername !== "string") {
      return NextResponse.json(
        { error: "GitHub username is required and must be a string" },
        { status: 400 }
      );
    }

    // Sanitize username (basic validation)
    const sanitizedUsername = githubUsername.trim();
    if (!/^[a-zA-Z0-9-]+$/.test(sanitizedUsername)) {
      return NextResponse.json(
        { error: "Invalid GitHub username format" },
        { status: 400 }
      );
    }

    const cacheDashboardDataKey = `${sanitizedUsername}-githubProfile`;
    const cacheDashboardData = await redisClient.get(cacheDashboardDataKey);
    if (cacheDashboardData) {
      const parsedData =
        typeof cacheDashboardData === "string"
          ? JSON.parse(cacheDashboardData)
          : cacheDashboardData;
      return NextResponse.json(parsedData, { status: 200 });
    }

    // Fetch basic GitHub user profile with proper error handling
    const userResult = await fetch(
      `https://api.github.com/users/${sanitizedUsername}`,
      {
        headers: {
          "User-Agent": "CrossPostHub",
        },
      }
    );

    if (!userResult.ok) {
      if (userResult.status === 404) {
        return NextResponse.json(
          { error: "GitHub user not found" },
          { status: 404 }
        );
      }
      if (userResult.status === 403) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded" },
          { status: 429 }
        );
      }
      throw new Error(`GitHub API responded with status: ${userResult.status}`);
    }

    const userData = await userResult.json();

    if (!userData) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub data" },
        { status: 500 }
      );
    }

    // Cache the data with proper await
    await redisClient.set(cacheDashboardDataKey, JSON.stringify(userData), {
      ex: 3 * 60 * 60, // 3 hours
    });

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/user:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch GitHub data: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while fetching GitHub data" },
      { status: 500 }
    );
  }
}

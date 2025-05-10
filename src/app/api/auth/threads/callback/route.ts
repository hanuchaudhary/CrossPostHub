import { NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import { encryptToken } from "@/lib/Crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../../[...nextauth]/options";

export interface AuthTokenDetails {
  id: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  picture: string;
  username: string;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/integrations/threads?error=${encodeURIComponent("Unauthorized")}`
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/integrations/threads?error=${encodeURIComponent("Missing authorization code")}`
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://graph.threads.net/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.THREADS_APP_ID!,
          client_secret: process.env.THREADS_APP_SECRET!,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/threads/callback`, // Updated to match frontend
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      if (tokenData.error_code === 1349245) {
        throw new Error("User must be added as a tester and accept the invitation in the Meta Developer dashboard.");
      }
      throw new Error(`Failed to obtain access token: ${tokenData.error?.message || "Unknown error"}`);
    }

    // Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(
      "https://graph.threads.net/access_token?" +
        new URLSearchParams({
          grant_type: "th_exchange_token",
          client_secret: process.env.THREADS_APP_SECRET!,
          access_token: tokenData.access_token,
          fields: "access_token,expires_in",
        }),
      { method: "GET" }
    );

    const longLivedTokenData = await longLivedTokenResponse.json();
    if (!longLivedTokenData.access_token) {
      throw new Error("Failed to exchange for long-lived token");
    }
    const accessToken = longLivedTokenData.access_token;

    // Fetch user information
    const userResponse = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${accessToken}`
    );
    const userData = await userResponse.json();

    if (!userData.id) {
      throw new Error("Failed to fetch user information");
    }

    const authDetails: AuthTokenDetails = {
      id: userData.id,
      name: userData.username || "Unknown",
      accessToken,
      refreshToken: accessToken,
      expiresIn: Math.floor(Date.now() / 1000) + 59 * 24 * 60 * 60,
      picture: userData.threads_profile_picture_url || "",
      username: userData.username || "",
    };

    let accessTokenIv: string | undefined;
    let accessTokenEncrypted: string | undefined;
    if (authDetails.accessToken) {
      const { iv, encrypted } = encryptToken(authDetails.accessToken);
      accessTokenEncrypted = encrypted;
      accessTokenIv = iv;
    }

    if (!session.user.id) {
      throw new Error("User ID is undefined in session");
    }

    const res = await prisma.account.upsert({
      where: {
        userId: session.user.id,
        provider_providerAccountId: {
          provider: "threads",
          providerAccountId: userData.id,
        },
      },
      update: {
        access_token: accessTokenEncrypted,
        access_token_iv: accessTokenIv,
        refresh_token: authDetails.refreshToken,
        expires_at: authDetails.expiresIn,
        token_type: "bearer",
      },
      create: {
        userId: session.user.id,
        provider: "threads",
        providerAccountId: userData.id,
        access_token: accessTokenEncrypted,
        access_token_iv: accessTokenIv,
        refresh_token: authDetails.refreshToken,
        expires_at: authDetails.expiresIn,
        token_type: "bearer",
        type: "oauth",
      },
    });

    console.log("Threads account created/updated:", res);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/integrations/threads?success=true`
    );
  } catch (error: any) {
    console.error("Authentication error:", error.message);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/integrations/threads?error=${encodeURIComponent(error.message)}`
    );
  }
}
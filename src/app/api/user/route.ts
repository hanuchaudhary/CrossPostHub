import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getTwitterUserDetails } from "@/utils/TwitterUtils/TwitterUtils";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { accounts: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const twittrAccount = user.accounts.find((account) => account.provider === "twitter");
        if (!twittrAccount) {
            return NextResponse.json({ error: "Twitter account not found" }, { status: 404 });
        }

        const twitterUserDetails = await getTwitterUserDetails({ oauth_token: twittrAccount?.access_token!, oauth_token_secret: twittrAccount?.access_token_secret! });

        return NextResponse.json({ twitterUserDetails }, { status: 200 });


    } catch (error) {
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}

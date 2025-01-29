import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
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

        const twitterAccount = user.accounts.find((account) => account.provider === "twitter");
        if (!twitterAccount) {
            return NextResponse.json({ error: "Twitter account not found" }, { status: 404 });
        }

        const twitterUserDetails = await getTwitterUserDetails({ oauth_token: twitterAccount?.access_token as string, oauth_token_secret: twitterAccount?.access_token_secret as string });

        return NextResponse.json({ twitterUserDetails }, { status: 200 });


    } catch (error) {
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}

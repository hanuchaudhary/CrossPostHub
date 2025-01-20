import OAuth from "oauth-1.0a"
import crypto from "crypto"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../[...nextauth]/options"

const oauth = new OAuth({
    consumer: {
        key: process.env.TWITTER_CONSUMER_KEY as string,
        secret: process.env.TWITTER_CONSUMER_SECRET as string,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64")
    },
})

export async function POST(request: Request) {
    const { oauth_token, oauth_verifier } = await request.json()
    const loggedUserSession = await getServerSession(authOptions);

    const requestData = {
        url: "https://api.twitter.com/oauth/access_token",
        method: "POST",
        data: { oauth_token, oauth_verifier },
    }

    try {
        const response = await fetch(requestData.url, {
            method: requestData.method,
            // @ts-ignore
            headers: oauth.toHeader(oauth.authorize(requestData)),
        })

        if (!response.ok) {
            throw new Error("Failed to get access token")
        }

        const data = await response.text()
        const {
            oauth_token: accessToken,
            oauth_token_secret: accessTokenSecret,
            user_id,
            screen_name,
        } = Object.fromEntries(new URLSearchParams(data))

        // Save user data to the database
        const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
        const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;

        if (!twitterConsumerKey || !twitterConsumerSecret) {
            throw new Error("Twitter consumer key or secret is not defined");
        }

        const user = await prisma.user.findUnique({
            where: { id: loggedUserSession?.user.id as string },
            include: { accounts: true },
        })

        const twitterAccount = user?.accounts.find((account) => account.provider === "twitter")

        if (twitterAccount) {
            await prisma.account.update({
                where: {
                    userId: loggedUserSession?.user.id,
                    provider_providerAccountId: {
                        provider: "twitter",
                        providerAccountId: twitterAccount.providerAccountId
                    }
                },
                data: {
                    access_token: accessToken,
                    access_token_secret: accessTokenSecret,
                    oauth_consumer_key: twitterConsumerKey,
                    oauth_consumer_secret: twitterConsumerSecret,
                    scope: "tweet.read tweet.write users.read offline.access"

                },
            })
        } else {
            await prisma.account.create({
                data: {
                    userId: loggedUserSession?.user.id as string,
                    type: "oauth",
                    provider: "twitter",
                    providerAccountId: user_id,
                    access_token: accessToken,
                    access_token_secret: accessTokenSecret,
                    oauth_consumer_key: twitterConsumerKey,
                    oauth_consumer_secret: twitterConsumerSecret,
                    scope: "tweet.read tweet.write users.read offline.access"
                },
            })
        }

        // Create a session for the user
        const session = await prisma.session.create({
            data: {
                sessionToken: crypto.randomBytes(32).toString("hex"),
                userId: loggedUserSession?.user.id as string,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
        })


        return NextResponse.json({
            success: true,
            user: {
                id: user?.id,
                name: user?.name,
                email: user?.email,
                image: user?.image,
            },
            sessionToken: session.sessionToken,
        })

    } catch (error) {
        console.error("Error:", error)
        return NextResponse.json({ error: "Failed to get access token and save user data" }, { status: 500 })
    }
}


import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { Providers } from "@/Types/Types";
import { CreateTextPost, CreatePostWithMedia, registerAndUploadMedia } from "@/utils/LinkedInUtils/LinkedinUtils";
import { createTweet, uploadMediaToTwiiter } from "@/utils/TwitterUtils/TwitterUtils";

interface ReqBody {
    postText: string;
    images: File[];
    providers: Providers[];
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const loggedUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { accounts: true }
        });
        if (!loggedUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const postText = formData.get("postText") as string;
        const images = formData.getAll("images") as File[];
        const providersJson = formData.get("providers") as string;
        const providers = JSON.parse(providersJson) as Providers[];

        if (providers.length === 0) {
            return NextResponse.json({ error: "Please select at least one provider" }, { status: 400 });
        }
        if (!postText && images.length === 0) {
            return NextResponse.json({ error: "Please enter some text or upload an image" }, { status: 400 });
        }

        const results = await Promise.all(
            providers.map(async (provider) => {
                if (provider === "linkedin") {

                    const linkedinAccount = loggedUser.accounts.find((acc) => acc.provider === "linkedin");
                    if (!linkedinAccount) {
                        return NextResponse.json({ error: "LinkedIn account not found" }, { status: 400 });
                    }

                    if (images.length !== 0) {
                        const assetURNs: string[] = [];

                        for (const image of images) {
                            const assetURN = await registerAndUploadMedia({
                                accessToken: linkedinAccount.access_token!,
                                personURN: linkedinAccount.providerAccountId!,
                                image
                            });
                            assetURNs.push(assetURN);
                        }

                        const postResponse = await CreatePostWithMedia({
                            accessToken: linkedinAccount.access_token!,
                            personURN: linkedinAccount.providerAccountId!,
                            assetURNs,
                            text: postText
                        });

                        return { provider: "linkedin", response: postResponse };
                    } else {
                        const postResponse = await CreateTextPost({
                            accessToken: linkedinAccount.access_token!,
                            personURN: linkedinAccount.providerAccountId!,
                            text: postText
                        });
                        return { provider: "linkedin", response: postResponse };
                    }
                }
                if (provider === "twitter") {
                    const twitterAccount = loggedUser.accounts.find((acc) => acc.provider === "twitter");
                    if (!twitterAccount) {
                        return NextResponse.json({ error: "Twitter account not found" }, { status: 400 });
                    }
                    //console.log(twitterAccount);

                    console.log("Images:", images, "PostText:", postText);

                    try {
                        let mediaIds: string[] = [];
                        if (images.length > 0) {
                            mediaIds = await Promise.all(
                                images.map(image =>
                                    uploadMediaToTwiiter({ media: image, oauth_token: twitterAccount.access_token!, oauth_token_secret: twitterAccount.access_token_secret! })
                                )
                            );
                        }
                        
                        console.log({
                            text: postText,
                            mediaIds,
                            oauth_token: twitterAccount.access_token!,
                            oauth_token_secret: twitterAccount.access_token_secret!
                        });
                        
                        // Create the Twitter post
                        const postResponse = await createTweet({ text: postText, mediaIds, oauth_token: twitterAccount.access_token!, oauth_token_secret: twitterAccount.access_token_secret! });
                        console.log("PostResponse:", postResponse);
                        return { provider: "twitter", response: postResponse };
                    } catch (error: any) {
                        console.error("Twitter posting error:", error);
                        return { provider: "twitter", error: error.message || "An error occurred" };

                    }
                }
                if (provider === "instagram") {
                    // Create the Instagram post
                    return { provider, response: null };
                }
                if (provider === "threads") {
                    // Create the Threads post
                    return { provider, response: null };
                }
                return { provider, response: null };
            })
        );

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("CreatePost Error:", error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}
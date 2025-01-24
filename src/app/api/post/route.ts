import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { Providers } from "@/Types/Types";
import { postQueue } from "@/lib/Redis/queue";
import { CreatePostWithMedia, CreateTextPost, registerAndUploadMedia } from "@/utils/LinkedInUtils/LinkedinUtils";
import { createTweet, uploadMediaToTwiiter } from "@/utils/TwitterUtils/TwitterUtils";
import { CheckCreatedPostMiddleware } from "@/utils/CheckCreatedPostMiddleware";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const loggedUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { accounts: true },
        });
        if (!loggedUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isAllowed = await CheckCreatedPostMiddleware(loggedUser.id);
        if (!isAllowed) {
            return NextResponse.json(
                { error: "You have reached your monthly limit of 5 posts. Upgrade your plan to Pro" },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        const postText = formData.get("postText") as string;
        const images = formData.getAll("images") as File[];
        const providersJson = formData.get("providers") as string;
        const providers = JSON.parse(providersJson) as Providers[];

        if (providers.length === 0) {
            return NextResponse.json(
                { error: "Please select at least one provider" },
                { status: 400 }
            );
        }
        if (!postText && images.length === 0) {
            return NextResponse.json(
                { error: "Please enter some text or upload an image" },
                { status: 400 }
            );
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

        // const results = await Promise.allSettled(
        //   providers.map(async (provider) => {
        //     try {
        //       const job = await postQueue.add(
        //         "postQueue",
        //         { provider, postText, images, loggedUser },
        //         // {
        //         //   attempts: 3,
        //         //   backoff: {
        //         //     type: "exponential",
        //         //     delay: 5000,
        //         //   },
        //         // }
        //       );
        //       console.log("Job added to the queue:", job.id);
        //       return { provider, jobId: job.id, status: "success" };
        //     } catch (error : any) {
        //       console.error(`Failed to add job for provider: ${provider}`, error);
        //       return { provider, error: error.message, status: "failed" };
        //     }
        //   })
        // );

        // const formattedResults = results.map((result) => {
        //   if (result.status === "fulfilled") {
        //     return result.value;
        //   } else {
        //     return { status: "failed", error: result.reason };
        //   }
        // });

        // return NextResponse.json({ results: formattedResults }, { status: 200 });

    } catch (error) {
        console.error("CreatePost Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}


// Without Queue Logic

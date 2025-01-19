import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { Providers } from "@/Types/Types";
import { CreateTextPost, CreatePostWithMedia, registerAndUploadMedia } from "@/utils/LinkedInUtils/LinkedinUtils";

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

        const { postText, images, providers }: ReqBody = await request.json();
        if (providers.length === 0) {
            return NextResponse.json({ error: "Please select at least one provider" }, { status: 400 });
        }
        if (!postText && images.length === 0) {
            return NextResponse.json({ error: "Please enter some text or upload an image" }, { status: 400 });
        }

        console.log("Creating post with text:", postText, "and images:", images, "for providers:", providers);


        const linkedinAccount = loggedUser.accounts.find((acc) => acc.provider === "linkedin");
        if (!linkedinAccount) {
            return NextResponse.json({ error: "LinkedIn account not found" }, { status: 400 });
        }

        console.log("LinkedIn Account:", linkedinAccount);


        const results = await Promise.all(
            providers.map(async (provider) => {
                if (provider === "linkedin") {
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

                        console.log("Asset URNs:", assetURNs);


                        // Create the LinkedIn post
                        const postResponse = await CreatePostWithMedia({
                            accessToken: linkedinAccount.access_token!,
                            personURN: linkedinAccount.providerAccountId!,
                            assetURNs,
                            text: postText
                        });

                        console.log("LinkedIn Post Response:", postResponse);
                        return { provider: "linkedin", response: postResponse };
                    } else {
                        const postResponse = await CreateTextPost({
                            accessToken: linkedinAccount.access_token!,
                            personURN: linkedinAccount.providerAccountId!,
                            text: postText
                        });

                        console.log("LinkedIn Post Response:", postResponse);
                        return { provider: "linkedin", response: postResponse };
                    }
                }
                if (provider === "twitter") {
                    // Create the Twitter post
                    return { provider, response: null };
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

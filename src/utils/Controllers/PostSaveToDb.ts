import prisma from "@/config/prismaConfig";

interface PostSaveToDBProps {
    postText: string;
    userId: string;
    provider: string;
    status?: "SUCCESS" | "FAILED";
}

export async function postSaveToDB({ postText, userId, provider,status }: PostSaveToDBProps) {
    const post = await prisma.post.create({
        data: {
            text: postText,
            userId,
            provider,
            status: status ?? "SUCCESS",
        },
    })
    return post;
}
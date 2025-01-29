import prisma from "@/config/prismaConfig";

interface PostSaveToDBProps {
    postText: string;
    userId: string;
    provider: string;
}

export async function postSaveToDB({ postText, userId, provider }: PostSaveToDBProps) {
    const post = await prisma.post.create({
        data: {
            text: postText,
            userId,
            provider
        },
    })
    return post;
}
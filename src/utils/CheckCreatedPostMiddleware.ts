import prisma from "@/config/prismaConfig";
import { startOfMonth, endOfMonth } from "date-fns";

export async function CheckCreatedPostMiddleware(userId: string): Promise<boolean> {
    try {
        const currentMonth = {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date()),
        };

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                plan: true,
            },
        });

        if (!user) {
            console.log("User not found");
            return false;
        }

        const monthlyPostCount = await prisma.post.count({
            where: {
                userId: user.id,
                createdAt: currentMonth,
            },
        });

        if (user.plan?.title === "Free" && monthlyPostCount >= 5) {
            console.log("You have reached your monthly limit of 5 posts.");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error in CheckCreatedPostMiddleware:", error);
        return false;
    }
}

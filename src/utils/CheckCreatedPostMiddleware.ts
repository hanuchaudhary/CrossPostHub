import prisma from "@/config/prismaConfig";
import { startOfMonth, endOfMonth } from "date-fns";

const FREE_PLAN_POST_LIMIT = 5; // Configurable post limit for free users

export async function CheckCreatedPostMiddleware(
  userId: string
): Promise<boolean> {
  try {
    const currentMonth = {
      gte: startOfMonth(new Date()),
      lte: endOfMonth(new Date()),
    };

    // Fetch user with their plan and post count for the current month
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
        _count: {
          select: {
            posts: {
              where: {
                createdAt: currentMonth,
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return false;
    }

    // Check if the user has a plan
    if (!user.plan) {
      console.error(`User ${userId} does not have an associated plan.`);
      return false;
    }

    const monthlyPostCount = user._count.posts;

    // Enforce post limit for free users
    if (
      user.plan.title === "Free" &&
      monthlyPostCount >= FREE_PLAN_POST_LIMIT
    ) {
      console.log(
        `User ${userId} has reached the monthly post limit of ${FREE_PLAN_POST_LIMIT}.`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in CheckCreatedPostMiddleware:", error);
    return false;
  }
}

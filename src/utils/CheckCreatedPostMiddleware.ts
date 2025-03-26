import prisma from "@/config/prismaConfig";
import { startOfMonth } from "date-fns";

const FREE_PLAN_POST_LIMIT = 10;
const PRO_PLAN_POST_LIMIT = 50;
const PREMIUM_PLAN_POST_LIMIT = Infinity;

export async function CheckCreatedPostMiddleware(
  userId: string
): Promise<boolean> {
  try {
    const currentMonthStart = startOfMonth(new Date());

    const userWithData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: "active" },
          include: { plan: true },
        },
        _count: {
          select: {
            posts: {
              where: {
                status: "SUCCESS",
                createdAt: { gte: currentMonthStart },
              },
            },
          },
        },
      },
    });

    if (!userWithData) {
      throw new Error(`User ${userId} not found.`);
    }

    const activeSubscription = userWithData.subscriptions[0]; // Get the first active subscription
    const monthlyPostCount = userWithData._count.posts;

    // Determine post limit based on subscription
    const postLimit =
      activeSubscription?.plan?.title === "Pro"
        ? PRO_PLAN_POST_LIMIT
        : activeSubscription?.plan?.title === "Premium"
          ? PREMIUM_PLAN_POST_LIMIT
          : FREE_PLAN_POST_LIMIT; // Default to Free plan if no active subscription

    console.log(`User ${userId} has ${monthlyPostCount} posts this month.`);

    if (monthlyPostCount >= postLimit) {
      console.log(`User ${userId} has reached their post limit for the month.`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in CheckCreatedPostMiddleware:", error);
    return false;
  }
}

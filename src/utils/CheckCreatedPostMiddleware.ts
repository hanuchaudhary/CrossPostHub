import prisma from "@/config/prismaConfig";

const FREE_PLAN_POST_LIMIT = 10; // Configurable post limit for free users
const PRO_PLAN_POST_LIMIT = 50; // Configurable post limit for pro users
const PREMIUM_PLAN_POST_LIMIT = Infinity; // Configurable post limit for premium users

export async function CheckCreatedPostMiddleware(
  userId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true, _count: { select: { posts: true } } },
    });

    if (!user) {
      console.log(`User ${userId} not found.`);
      return false;
    }

    // Fetch user with their plan and post count for the current month
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "active" },
      include: { plan: true },
    });

    const monthlyPostCount = user?._count?.posts;

    if (!subscription) {
      console.log(`User ${userId} does not have an active subscription.`);
      return false;
    }

    let postLimit = 0;
    switch (subscription.plan.title) {
      case "Free":
        postLimit = FREE_PLAN_POST_LIMIT;
        break;
      case "Pro":
        postLimit = PRO_PLAN_POST_LIMIT;
        break;
      case "Premium":
        postLimit = PREMIUM_PLAN_POST_LIMIT;
        break;
      default:
        postLimit = FREE_PLAN_POST_LIMIT;
    }

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

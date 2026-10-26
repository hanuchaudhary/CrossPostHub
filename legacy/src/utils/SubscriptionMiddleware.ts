import prisma from "@/config/prismaConfig";
import { startOfMonth } from "date-fns";

const PLAN_LIMITS = {
  FREE_PLAN_LIMITS: {
    POST_LIMIT: 25,
    GENERATED_IMAGE_LIMIT: 1,
    SCHEDULED_POST_LIMIT: 5,
  },
  PRO_PLAN_LIMITS: {
    POST_LIMIT: 60,
    GENERATED_IMAGE_LIMIT: 10,
    SCHEDULED_POST_LIMIT: 20,
  },
  PREMIUM_PLAN_LIMITS: {
    POST_LIMIT: Infinity,
    GENERATED_IMAGE_LIMIT: 30,
    SCHEDULED_POST_LIMIT: Infinity,
  },
};

class SubscriptionMiddleware {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getUserData() {
    const currentMonthStart = startOfMonth(new Date());
    const userWithData = await prisma.user.findUnique({
      where: { id: this.userId },
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
            generatedImages: {
              where: {
                createdAt: { gte: currentMonthStart },
              },
            },
          },
        },
      },
    });

    const scheduledPostsCount = await prisma.post.count({
      where: {
        userId: this.userId,
        isScheduled: true,
        createdAt: { gte: currentMonthStart },
      },
    });

    if (!userWithData) {
      throw new Error(`User ${this.userId} not found.`);
    }

    return {
      ...userWithData,
      _count: {
        ...userWithData._count,
        scheduledPosts: scheduledPostsCount,
      },
    };
  }

  private getPostLimit(planTitle: string | undefined): number {
    switch (planTitle) {
      case "Pro":
        return PLAN_LIMITS.PRO_PLAN_LIMITS.POST_LIMIT;
      case "Premium":
        return PLAN_LIMITS.PREMIUM_PLAN_LIMITS.POST_LIMIT;
      default:
        return PLAN_LIMITS.FREE_PLAN_LIMITS.POST_LIMIT;
    }
  }

  public async canCreatePost(): Promise<boolean> {
    try {
      const userWithData = await this.getUserData();
      const activeSubscription = userWithData.subscriptions[0];
      const monthlyPostCount = userWithData._count.posts;

      const postLimit = this.getPostLimit(activeSubscription?.plan?.title);

      console.log(
        `User ${this.userId} has ${monthlyPostCount} posts this month.`
      );

      if (monthlyPostCount >= postLimit) {
        console.log(
          `User ${this.userId} has reached their post limit for the month.`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in canCreatePost:", error);
      return false;
    }
  }

  public async canGenerateImage(): Promise<boolean> {
    try {
      const userWithData = await this.getUserData();
      const activeSubscription = userWithData.subscriptions[0];
      const monthlyImageCount = (await this.getUserData())._count
        .generatedImages;

      const imageLimit =
        activeSubscription?.plan?.title === "Pro"
          ? PLAN_LIMITS.PRO_PLAN_LIMITS.GENERATED_IMAGE_LIMIT
          : activeSubscription?.plan?.title === "Premium"
            ? PLAN_LIMITS.PREMIUM_PLAN_LIMITS.GENERATED_IMAGE_LIMIT
            : PLAN_LIMITS.FREE_PLAN_LIMITS.GENERATED_IMAGE_LIMIT;

      if (monthlyImageCount >= imageLimit) {
        console.log(
          `User ${this.userId} has reached their image generation limit for the month.`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in canGenerateImage:", error);
      return false;
    }
  }

  public async canSchedulePost(): Promise<boolean> {
    try {
      const userWithData = await this.getUserData();
      const activeSubscription = userWithData.subscriptions[0];
      const monthlyScheduledPostCount = userWithData._count.scheduledPosts; // Assuming this counts scheduled posts

      const scheduleLimit =
        activeSubscription?.plan?.title === "Pro"
          ? PLAN_LIMITS.PRO_PLAN_LIMITS.SCHEDULED_POST_LIMIT
          : activeSubscription?.plan?.title === "Premium"
            ? PLAN_LIMITS.PREMIUM_PLAN_LIMITS.SCHEDULED_POST_LIMIT
            : PLAN_LIMITS.FREE_PLAN_LIMITS.SCHEDULED_POST_LIMIT;

      if (monthlyScheduledPostCount >= scheduleLimit) {
        console.log(
          `User ${this.userId} has reached their scheduled post limit for the month.`
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error in canSchedulePost:", error);
      return false;
    }
  }
}

export default SubscriptionMiddleware;

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import cron from "node-cron";

// Schedule the cron job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running subscription expiration check...");

  try {
    const currentDate = new Date();

    // Find subscriptions that are active but have a nextBillingAt date in the past
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingAt: {
          lt: currentDate, // Less than the current date
        },
      },
    });

    for (const subscription of subscriptions) {
      console.log(`Marking subscription ${subscription.id} as expired...`);
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "expired",
          nextBillingAt: null,
        },
      });
    }

    console.log(
      `Checked ${subscriptions.length} subscriptions for expiration.`
    );
  } catch (error) {
    console.error("Error checking subscriptions for expiration:", error);
  }
});

// API route to manually trigger the cron job for testing
export async function GET(request: NextRequest) {
  try {
    const currentDate = new Date();

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingAt: {
          lt: currentDate,
        },
      },
    });

    for (const subscription of subscriptions) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "expired",
          nextBillingAt: null,
        },
      });
    }

    return NextResponse.json({
      message: `Checked ${subscriptions.length} subscriptions for expiration.`,
    });
  } catch (error) {
    console.error("Error checking subscriptions for expiration:", error);
    return NextResponse.json(
      { error: "Failed to check subscriptions for expiration" },
      { status: 500 }
    );
  }
}

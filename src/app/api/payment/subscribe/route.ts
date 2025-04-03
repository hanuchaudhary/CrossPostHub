import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/config/prismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId } = await request.json();

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }
    
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({
      where: { razorpayPlanId: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    if (plan.price === 0) {
      const subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          razorpaySubscriptionId: null,
          status: "active",
          nextBillingAt: null,
        },
      });

      return NextResponse.json({
        message: "Free plan activated",
        subscriptionId: subscription.id,
        redirect: "/dashboard",
      });
    } else {
      // Create a Razorpay subscription for paid plans
      const subscription = await razorpay.subscriptions.create({
        plan_id: plan.razorpayPlanId!,
        customer_notify: 1,
        total_count: 12,
        notes: {
          userId: session.user.id,
          planId: planId,
        },
      });

      // Save the subscription details in your database
      const dbSubscription = await prisma.subscription.create({
        data: {
          id: subscription.id,
          userId: session.user.id,
          planId: plan.id,
          razorpaySubscriptionId: subscription.id,
          status: subscription.status,
          nextBillingAt: new Date(subscription.current_end! * 1000), // Convert to milliseconds
        },
      });

      return NextResponse.json({
        short_url: subscription.short_url,
        subscriptionId: dbSubscription.id,
      });
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

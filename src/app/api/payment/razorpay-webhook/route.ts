import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  // Verify signature
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== generatedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const event = payload.event;
  const subscriptionData = payload.payload.subscription.entity;
  
  try {
    // Find subscription by razorpaySubscriptionId (not id)
    const dbSubscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: subscriptionData.id },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (event === "subscription.charged") {
      // Update the subscription
      let nextBillingDate = null;
      if (subscriptionData.current_end) {
        nextBillingDate = new Date(subscriptionData.current_end * 1000); // Convert to milliseconds
        console.log("Next billing date:", nextBillingDate);
      }

      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: "active",
          nextBillingAt: nextBillingDate,
        },
      });

      // Create transaction record
      const payment = payload.payload.payment.entity;
      await prisma.transaction.create({
        data: {
          userId: dbSubscription.userId,
          order_id: payment.order_id,
          paymentId: payment.id,
          status: "SUCCESS",
          amount: payment.amount / 100,
          captured: true,
          paymentMethod: subscriptionData.payment_method,
          subscriptionId: dbSubscription.id,
          description: "Subscription payment",
        },
      });
    }
    if (event === "subscription.failed") {
      // Update the subscription
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: "failed",
        },
      });

      // Create transaction record
      const payment = payload.payload.payment.entity;
      await prisma.transaction.create({
        data: {
          userId: dbSubscription.userId,
          order_id: payment.order_id,
          paymentId: payment.id,
          status: "FAILED",
          amount: payment.amount / 100,
          captured: false,
          paymentMethod: subscriptionData.payment_method,
          subscriptionId: dbSubscription.id,
          description: "Subscription payment",
        },
      });
    }
    if (event === "subscription.paused") {
      // Update the subscription
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: "paused",
        },
      });

      // Create transaction record
      const payment = payload.payload.payment.entity;
      await prisma.transaction.create({
        data: {
          userId: dbSubscription.userId,
          order_id: payment.order_id,
          paymentId: payment.id,
          status: "CANCELLED",
          amount: payment.amount / 100,
          captured: false,
          paymentMethod: subscriptionData.payment_method,
          subscriptionId: dbSubscription.id,
          description: "Subscription payment",
        },
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

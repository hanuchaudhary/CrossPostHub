import { NextRequest, NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

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
    const dbSubscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: subscriptionData.id },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    console.log("Event received:", event, subscriptionData);

    if (event === "subscription.charged") {
      const nextBillingDate = subscriptionData.current_end
        ? new Date(subscriptionData.current_end * 1000)
        : null;

      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: "active", nextBillingAt: nextBillingDate },
      });

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
    } else if (event === "subscription.failed") {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: "failed" },
      });

      const payment = payload.payload.payment?.entity || {};
      if (payment.id) {
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
    } else if (event === "subscription.paused") {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: "paused" },
      });

      const payment = payload.payload.payment?.entity || {};
      if (payment.id) {
        await prisma.transaction.create({
          data: {
            userId: dbSubscription.userId,
            order_id: payment.order_id,
            paymentId: payment.id,
            status: "PAUSED", // Changed from CANCELLED
            amount: payment.amount / 100,
            captured: false,
            paymentMethod: subscriptionData.payment_method,
            subscriptionId: dbSubscription.id,
            description: "Subscription paused",
          },
        });
      }
    } else if (event === "subscription.activated") {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: "active",
          nextBillingAt: subscriptionData.current_end
            ? new Date(subscriptionData.current_end * 1000)
            : null,
        },
      });
    } else if (event === "subscription.cancelled") {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: "cancelled" },
      });
    } else if (event === "subscription.completed") {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: "completed" },
      });
    } else {
      console.log("Unhandled event:", event);
      return NextResponse.json({ status: "ignored" });
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

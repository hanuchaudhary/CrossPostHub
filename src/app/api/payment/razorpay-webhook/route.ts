import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/config/prismaConfig";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Verify the webhook signature to ensure the request is from Razorpay
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  if (!secret) return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  if (signature !== generatedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = body.event;
  const subscription = body.payload.subscription.entity;

  try {
    // Find the subscription in the database using razorpaySubscriptionId
    const dbSubscription = await prisma.subscription.findUnique({
      where: { id: subscription.id },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (event === "subscription.charged") {
      // Update the subscription status to "active"
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "active",
          nextBillingAt: new Date(subscription.next_billing_at * 1000),
        },
      });

      // Create a transaction record for the payment
      const payment = body.payload.payment.entity;
      await prisma.transaction.create({
        data: {
          userId: dbSubscription.userId,
          order_id: payment.order_id,
          paymentId: payment.id,
          status: "SUCCESS",
        },
      });

      //TODO: Send an email to the user confirming the payment
    } else if (event === "subscription.paused") {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "paused" },
      });

      const payment = body.payload.payment?.entity;
      if (payment && payment.status === "failed") {
        await prisma.transaction.create({
          data: {
            userId: dbSubscription.userId,
            status: "FAILED",
            order_id: payment.order_id,
            paymentId: payment.id || "",
          },
        });
      }
    } else if (event === "subscription.cancelled") {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "cancelled" },
      });

      await prisma.transaction.create({
        data: {
          userId: dbSubscription.userId,
          order_id: subscription.current_invoice_id,
          paymentId: null,
          status: "CANCELLED",
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

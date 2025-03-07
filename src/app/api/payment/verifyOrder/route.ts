import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/config/prismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export interface VerifyBody {
  planId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    }: VerifyBody = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required parameters", success: false },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret not found" },
        { status: 400 }
      );
    }

    const HMAC = crypto.createHmac("sha256", secret);
    HMAC.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = HMAC.digest("hex");

    if (generatedSignature === razorpay_signature) {
      // Update the transaction status
      await prisma.transaction.update({
        where: {
          userId: session.user.id,
          order_id: razorpay_order_id,
        },
        data: {
          status: "SUCCESS",
          paymentId: razorpay_payment_id, // Save payment ID
        },
      });

      // Update the user plan
      await prisma.user.update({
        where: { id: session.user.id },
        data: { planId },
      });

      return NextResponse.json({
        message: "Payment verified successfully",
        success: true,
      });
    } else {
      // Payment verification failed
      await prisma.transaction.update({
        where: {
          userId: session.user.id,
          order_id: razorpay_order_id,
        },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: "Invalid signature", success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "An error occurred", success: false },
      { status: 500 }
    );
  }
}

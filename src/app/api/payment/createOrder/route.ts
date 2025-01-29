import prisma from "@/config/prismaConfig";
import { error } from "console";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { authOptions } from "../../auth/[...nextauth]/options";

const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are missing");
}

const razorpay = new Razorpay({
    key_id,
    key_secret
})

export type OrderBody = {
    amount: number;
    currency: string;
    planId?: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { amount, currency, planId }: OrderBody = await request.json();
        if (!amount || !planId) {
            return NextResponse.json({ message: `Amount is required` }, { status: 400 })
        }

        const options = {
            amount,
            currency: currency || "INR",
            receipt: `receipt#${Date.now()}`,
        }

        const order = await razorpay.orders.create(options);

        if (!order) {
            return NextResponse.json({ message: "Failed to create order" }, { status: 500 })
        }

        await prisma.transaction.create({
            data: {
                status: "PENDING",
                planId: planId,
                userId: session.user.id,
                amount: amount,
                order_id: order.id
            }
        });

        console.log("Order Created Successfully");

        return NextResponse.json({ orderId: order.id }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: "Server Error", error }, { status: 500 })
    }
}
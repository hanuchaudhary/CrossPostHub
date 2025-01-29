import prisma from "@/config/prismaConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const pricingPlans = await prisma.plan.findMany();
        return NextResponse.json({ pricingPlans }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}
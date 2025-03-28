import prisma from "@/config/prismaConfig";
import { redis } from "@/config/redisConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cachedPricingPlansKey = "pricingPlans";
    const cachedPricingPlans = await redis.get(cachedPricingPlansKey);

    if (typeof cachedPricingPlans === "string") {
      console.log("Returning cached pricing plans");
      return NextResponse.json(
        { pricingPlans: JSON.parse(cachedPricingPlans) },
        { status: 200 }
      );
    }

    const pricingPlans = await prisma.plan.findMany();

    // Cache the pricing plans for 24 hours
    await redis.set(cachedPricingPlansKey, JSON.stringify(pricingPlans), {
      ex: 86400, // 24 hours in seconds
    });

    return NextResponse.json({ pricingPlans }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

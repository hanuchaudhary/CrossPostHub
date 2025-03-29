import prisma from "@/config/prismaConfig";
import { redisClient } from "@/config/redisConfig";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cachedPricingPlansKey = "pricingPlans";
    const cachedPricingPlans = await redisClient.get(cachedPricingPlansKey);

    if (cachedPricingPlans) {
      console.log("Returning cached pricing plans");
      return NextResponse.json(
        { pricingPlans: cachedPricingPlans },
        { status: 200 }
      );
    }

    const pricingPlans = await prisma.plan.findMany();

    // Cache the pricing plans for 24 hours
    await redisClient.set(cachedPricingPlansKey, JSON.stringify(pricingPlans), {
      ex: 86400, // Expire in 24 hours
    });

    return NextResponse.json({ pricingPlans }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

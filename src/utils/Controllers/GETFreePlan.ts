import prisma from "@/config/prismaConfig";

let freePlanId: string | null = null;

export async function getFreePlanId() {
  if (!freePlanId) {
    const freePlan = await prisma.plan.findFirst({
      where: { title: "Free" },
    });
    if (!freePlan) {
      throw new Error("Free Tier plan not found in the database.");
    }
    freePlanId = freePlan.id;
  }
  return freePlanId;
}

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const plans = [
  { id: "free", title: "Free", price: 0, description: "Essential cross-posting tools for individuals.", features: ["Connect 2 platforms", "25 posts/month", "5 scheduled posts/month", "1 image generation/month"], cta: "Get Started", dodoProductId: null },
  { id: "pro", title: "Pro", price: 10, description: "Scheduling and higher limits for active creators.", features: ["Connect 2 platforms", "60 posts/month", "20 scheduled posts/month", "10 image generations/month"], cta: "Upgrade to Pro", dodoProductId: process.env.DODO_PRODUCT_PRO || null },
  { id: "premium", title: "Premium", price: 20, description: "Unlimited posting and scheduling for teams and businesses.", features: ["Unlimited platforms", "Unlimited posts and scheduling", "30 image generations/month", "Premium support"], cta: "Go Premium", dodoProductId: process.env.DODO_PRODUCT_PREMIUM || null },
];

for (const plan of plans) {
  await db.plan.upsert({ where: { id: plan.id }, create: plan, update: plan });
}
await db.$disconnect();

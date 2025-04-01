import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pricingPlans = [
  {
    id: "cm6au8r5a0000qx5cd3my4bjx",
    title: "Free",
    price: 0,
    description:
      "Get started for free – ideal for individuals dipping their toes into social media management with essential tools, no payment setup required.",
    features: [
      "Connect only 2 platforms",
      "10 posts/month",
      "Basic analytics",
      "Community support",
      "Single media support",
    ],
    cta: "Get Started",
    razorpayPlanId: "", // Free plan doesn’t need a Razorpay plan
  },
  {
    id: "cm6au8r5c0001qx5ccwbife9l",
    title: "Pro",
    price: 10,
    description:
      "Step up to Pro – perfect for creators and pros who need advanced scheduling and analytics, seamlessly powered by Razorpay billing.",
    features: [
      "Connect up to 2 platforms",
      "50 posts/month",
      "Post scheduling",
      "Multiple media support",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID, // Replace with your Razorpay Pro plan ID
  },
  {
    id: "cm6au8r5c0002qx5cbfiz0puk",
    title: "Premium",
    price: 20,
    description:
      "Go all-in with Premium – built for businesses and teams demanding unlimited scale and premium support, backed by effortless Razorpay payments.",
    features: [
      "Connect unlimited platforms",
      "Unlimited posts and scheduling",
      "Team collaboration",
      "Premium support",
      "Other",
    ],
    cta: "Go Premium",
    razorpayPlanId: process.env.RAZORPAY_PREMIUM_PLAN_ID, // Replace with your Razorpay Premium plan ID
  },
];

async function main() {
  for (const plan of pricingPlans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: {},
      create: {
        id: plan.id,
        title: plan.title,
        price: plan.price,
        description: plan.description,
        features: plan.features,
        cta: plan.cta,
        razorpayPlanId: plan.razorpayPlanId,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

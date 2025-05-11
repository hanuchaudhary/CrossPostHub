import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pricingPlans = [
  {
    id: "free", // Free plan ID
    title: "Free",
    price: 0,
    description:
      "Get started for free – ideal for individuals dipping their toes into social media management with essential tools, no payment setup required.",
    features: [
      "Connect only 2 platforms",
      "First 5 posts free",
      "Basic analytics",
      "Community support",
      "Single media support",
      "1 Image generation",
    ],
    cta: "Get Started",
    razorpayPlanId: "", // Free plan doesn’t need a Razorpay plan
  },
  {
    id: process.env.RAZORPAY_PRO_PLAN_ID, // Replace with your Razorpay Pro plan ID
    title: "Pro",
    price: 5,
    description:
      "Step up to Pro – perfect for creators and pros who need advanced scheduling and analytics, seamlessly powered by Razorpay billing.",
    features: [
      "Connect up to 2 platforms",
      "70 + 5 bonus posts",
      "Post scheduling",
      "Multiple media support",
      "Advanced analytics",
      "15 Image generations",
      "Priority Support"
    ],
    cta: "Upgrade to Pro",
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID, // Replace with your Razorpay Pro plan ID
  },
  {
    id: process.env.RAZORPAY_PREMIUM_PLAN_ID, // Replace with your Razorpay Premium plan ID
    title: "Premium",
    price: 10,
    description:
      "Go all-in with Premium – built for businesses and teams demanding unlimited scale and premium support, backed by effortless Razorpay payments.",
    features: [
      "Connect unlimited platforms",
      "150 + 10 bonus posts",
      "Unlimited media support",
      "35 Image generations",
      "Team collaboration",
      "Premium support",
    ],
    cta: "Go Premium",
    razorpayPlanId: process.env.RAZORPAY_PREMIUM_PLAN_ID, // Replace with your Razorpay Premium plan ID
  },
];

async function main() {
  for (const plan of pricingPlans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: {
        title: plan.title,
        price: plan.price,
        description: plan.description,
        features: plan.features,
        cta: plan.cta,
        razorpayPlanId: plan.razorpayPlanId,
      },
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
  console.log("Pricing plans seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pricingPlans = [
    {
        id: "cm6au8r5a0000qx5cd3my4bjx",
        title: "Free",
        price: 0,
        description:
            "Perfect for individuals managing personal accounts with basic needs.",
        features: [
            "Connect only 2 platforms",
            "5 posts/month",
            "Basic analytics",
            "Community support",
        ],
        cta: "Get Started",
    },
    {
        id: "cm6au8r5c0001qx5ccwbife9l",
        title: "Pro",
        price: 15,
        description:
            "Great for professionals managing multiple accounts and looking for advanced tools.",
        features: [
            "Connect up to 5 platforms",
            "Unlimited posts",
            "Advanced analytics",
            "Priority support",
            "Scheduling posts",
        ],
        cta: "Upgrade to Pro",
    },
    {
        id: "cm6au8r5c0002qx5cbfiz0puk",
        title: "Premium",
        price: 30,
        description:
            "Ideal for businesses and teams requiring full flexibility and premium features.",
        features: [
            "Connect unlimited platforms",
            "Unlimited posts and scheduling",
            "Team collaboration",
            "Premium support",
            "Custom branding",
        ],
        cta: "Go Premium",
    },
];

async function main() {
    for (const plan of pricingPlans) {
        await prisma.plan.create({
            data: {
                title: plan.title,
                price: plan.price,
                description: plan.description,
                features: plan.features,
                cta: plan.cta,
            },
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

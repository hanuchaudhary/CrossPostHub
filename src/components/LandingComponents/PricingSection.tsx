import PricingCard from "./PricingCard";

export default function PricingSection() {
  const pricingPlans = [
    {
      id: "free",
      title: "Free",
      price: "0$",
      features: [
        "Connect up to 2 platforms",
        "5 posts/month",
        "Basic analytics",
        "Community support",
      ],
      cta: "Get Started",
    },
    {
      id: "pro",
      title: "Pro",
      price: "15$",
      features: [
        "Connect up to 5 platforms",
        "Unlimited posts",
        "Advanced analytics",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
    },
    {
      id: "premium",
      title: "Premium",
      price: "30$",
      features: [
        "Connect unlimited platforms",
        "Unlimited posts and scheduling",
        "Team collaboration",
        "Premium support",
      ],
      cta: "Go Premium",
    },
  ];

  return (
    <>
      <div className="text-center py-10">
        <h1 className="font-ClashDisplaySemibold text-lg md:text-4xl">
          &quot;Find the Perfect Plan for Your Needs&quot;
        </h1>
        <h3 className="font-ClashDisplayRegular md:text-base text-xs dark:text-neutral-400 text-neutral-700">
          Pick your plan and start sharing smarter today.
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-3 md:gap-10 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => (
          <PricingCard
            classname={`${plan.id === "pro" && "md:scale-110"}`}
            key={plan.id}
            title={plan.title}
            price={plan.price}
            features={plan.features}
            cta={plan.cta}
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          />
        ))}
      </div>
    </>
  );
}

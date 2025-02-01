"use client";

import { usePricingStore } from "@/store/PricingStore/usePricingStore";
import PricingCard from "./PricingCard";
import { useEffect } from "react";
import PricingLoader from "../Loaders/PricingLoader";

export default function PricingSection() {
  // const pricingPlans = [
  //   {
  //     id: "cm6au8r5a0000qx5cd3my4bjx",
  //     title: "Free",
  //     price: 0,
  //     description:
  //       "Perfect for individuals managing personal accounts with basic needs.",
  //     features: [
  //       "Connect only 2 platforms",
  //       "5 posts/month",
  //       "Basic analytics",
  //       "Community support",
  //     ],
  //     cta: "Get Started",
  //   },
  //   {
  //     id: "cm6au8r5c0001qx5ccwbife9l",
  //     title: "Pro",
  //     price: 15,
  //     description:
  //       "Great for professionals managing multiple accounts and looking for advanced tools.",
  //     features: [
  //       "Connect up to 5 platforms",
  //       "Unlimited posts",
  //       "Advanced analytics",
  //       "Priority support",
  //       "Scheduling posts",
  //     ],
  //     cta: "Upgrade to Pro",
  //   },
  //   {
  //     id: "cm6au8r5c0002qx5cbfiz0puk",
  //     title: "Premium",
  //     price: 30,
  //     description:
  //       "Ideal for businesses and teams requiring full flexibility and premium features.",
  //     features: [
  //       "Connect unlimited platforms",
  //       "Unlimited posts and scheduling",
  //       "Team collaboration",
  //       "Premium support",
  //       "Custom branding",
  //     ],
  //     cta: "Go Premium",
  //   },
  // ];

  const { fetchPricingPlans, isFetchingPlans, pricingPlans } =
    usePricingStore();
  useEffect(() => {
    fetchPricingPlans();
  }, [fetchPricingPlans]);

  return (
    <div className="max-w-[65rem] mx-auto lg:px-0 px-5 pb-5">
      <div className="text-center py-16">
        <h1 className="font-ClashDisplaySemibold text-lg md:text-4xl">
          &quot;Find the <span className="text-emerald-500">Perfect Plan</span> for Your Needs&quot;
        </h1>
        <h3 className="font-ClashDisplayRegular md:text-base text-xs dark:text-neutral-400 text-neutral-700">
          Pick your plan and start sharing smarter today.
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-3 md:gap-7 max-w-6xl mx-auto">
        {pricingPlans?.map((plan) =>
          isFetchingPlans ? (
            <PricingLoader key={plan.id} />
          ) : (
            <PricingCard
              classname={`${
                plan.title === "Pro" &&
                "md:scale-110 bg-emerald-950/10 dark:bg-emerald-950 border-emerald-950/20"
              }`}
              key={plan.id}
              {...plan}
              price={Number(plan.price)}
            />
          )
        )}
      </div>
    </div>
  );
}

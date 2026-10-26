import PricingSection from "@/components/LandingComponents/PricingSection";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Upgrade | CrossPostHub",
  description: "Upgrade your account to unlock premium features and benefits.",
};

export default function Page() {
  return (
    <div>
      <PricingSection />
    </div>
  );
}

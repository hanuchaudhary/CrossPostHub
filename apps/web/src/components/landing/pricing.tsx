import { useState } from "react";
import { Link } from "react-router";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Reveal } from "./reveal";
import { LandingSection } from "./section";

const pricingPlans = [
  {
    title: "Free",
    monthly: 0,
    yearly: 0,
    description: "For finding your rhythm.",
    features: [
      "25 posts per month",
      "5 scheduled posts per month",
      "Connect your social accounts",
      "One place for every idea",
    ],
    cta: "Start for free",
  },
  {
    title: "Pro",
    monthly: 12,
    yearly: 10,
    description: "For keeping the good ideas going.",
    features: [
      "60 posts per month",
      "20 scheduled posts per month",
      "Everything in Free",
      "A calmer publishing workflow",
    ],
    cta: "Find your flow",
    popular: true,
  },
  {
    title: "Premium",
    monthly: 24,
    yearly: 20,
    description: "For your next big chapter.",
    features: [
      "Unlimited posts",
      "Unlimited scheduled posts",
      "Everything in Pro",
      "Room for your growing brand",
    ],
    cta: "Make more happen",
  },
];
export function Pricing() {
  const [billing, setBilling] = useState("monthly");
  return (
    <LandingSection id="pricing">
      <Reveal className="mb-14 flex flex-col items-start gap-7">
        <h2 className="heading">
          Start with an idea.
          <br />
          <span className="text-muted-foreground">Grow at your own pace.</span>
        </h2>
        <p className="subheading max-w-md!">
          Choose the publishing tools that fit your workflow.
        </p>
        <Tabs value={billing} onValueChange={setBilling}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </Reveal>
      <div className="grid gap-10 md:gap-8 md:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <Reveal
            key={plan.title}
            delay={index * 0.12}
            className="flex min-w-0 flex-col gap-4 border-t py-6 transition-colors duration-300 hover:border-foreground"
          >
            <header className="flex flex-col gap-2">
              <div className="mb-2 flex h-5 items-center justify-between">
                <h3 className="font-light tracking-tight text-xl">
                  {plan.title}
                </h3>
                {plan.popular && <Badge>Creator favorite</Badge>}
              </div>
              <p className="text-sm font-light leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
            </header>
            <div className="min-w-0 space-y-5">
              <div>
                <p className="text-5xl font-light tracking-tighter">
                  ${billing === "yearly" ? plan.yearly : plan.monthly}
                  <span className="ml-2 text-xs font-normal tracking-normal text-muted-foreground">
                    / month
                  </span>
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {!plan.monthly
                    ? "Free. For as long as you like."
                    : billing === "yearly"
                      ? "Billed yearly · illustrative pricing"
                      : "Billed monthly · illustrative pricing"}
                </p>
              </div>
              <Separator />
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs">
                    <Icon name="check" size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                nativeButton={false}
                render={
                  <Link to={`/register?plan=${plan.title.toLowerCase()}`} />
                }
              >
                {plan.cta}
                <Icon name="arrow" />
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
}

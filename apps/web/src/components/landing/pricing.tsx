import { useState } from "react";
import { Link } from "react-router";

import { SiteCorners, SiteRule } from "../corners";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

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
    <section
      id="pricing"
      className="relative"
    >
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative h-[calc(100vh-4rem)] p-10">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        <SiteCorners />
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <Badge variant="outline">BIG IDEAS. LITTLE PRICE TAGS.</Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Find your kind of flow.
          </h2>
          <p className="text-sm text-muted-foreground">
            Start small. Make your mark. Grow at your own pace.
          </p>
          <Tabs value={billing} onValueChange={setBilling}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly <Badge variant="secondary">Save up to 17%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <section
              key={plan.title}
              className="flex min-w-0 flex-col gap-4 border-t py-6"
            >
              <header className="flex flex-col gap-2">
                <div className="mb-2 flex h-5 items-center justify-between">
                  <h2 className="font-medium text-lg">{plan.title}</h2>
                  {plan.popular && <Badge>Creator favorite</Badge>}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </header>
              <div className="min-w-0 space-y-5">
                <div>
                  <p className="text-4xl font-semibold tracking-tight">
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
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs"
                    >
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
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

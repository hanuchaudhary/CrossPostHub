import { Link } from "react-router";

import { IconCircleCheckFilled } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cn } from "cn";

import { getPlan, PRICING_PLANS } from "@repo/shared/pricing";

import { QueryState } from "@/components/workspace/common";
import { errorMessage, openBillingPortal, startPlanCheckout } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { queries } from "@/lib/query";
import { toast } from "@/lib/toast";

import { FrameBox } from "../corners";
import GradientASCII from "../GradientASCII";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { LandingSection } from "./section";

export function Pricing() {
  const { data: session, isPending } = authClient.useSession();
  const subscription = useQuery({
    ...queries.subscription(),
    enabled: Boolean(session?.user),
  });
  const current = getPlan(subscription.data?.subscription?.planId);
  const manageSubscription =
    current.price > 0 &&
    ["active", "on_hold", "pending"].includes(subscription.data?.status ?? "");
  const billing = useMutation({
    mutationFn: (planId: string) =>
      manageSubscription ? openBillingPortal() : startPlanCheckout(planId),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <LandingSection id="pricing">
      <div className="mb-14 space-y-7">
        <h2 className="heading">
          Start with an idea.
          <br />
          <span className="text-muted-foreground">Grow at your own pace.</span>
        </h2>
        <p className="subheading max-w-md!">
          A little room to start.
          <br />
          More room when you need it.
        </p>
      </div>
      {session?.user && subscription.isError && (
        <QueryState
          pending={false}
          error={subscription.error}
          retry={() => subscription.refetch()}
        />
      )}
      <div className="grid gap-7 md:grid-cols-3 md:gap-0">
        {PRICING_PLANS.map((plan) => (
          <FrameBox
            key={plan.id}
            tone="rail"
            className={`flex h-full min-w-0 flex-col px-6 py-8 md:px-7 relative overflow-hidden`}
          >
            {plan.popular && (
              <div className="h-full w-full absolute inset-0">
                <GradientASCII
                  className="h-full w-full opacity-30 rotate-180"
                  colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
                  shape="horizon"
                  characters=" =+xX0S8#@"
                  cellSize={18}
                  density={0.8}
                  glyphOpacity={0.85}
                  glow={0.2}
                  depthOfField={0}
                  flicker={0.2}
                  softness={0.5}
                  scale={1}
                  flow={0.5}
                  speed={1}
                  gradientOpacity={0.9}
                  grain={0.08}
                  variation={0}
                  mouseInteraction
                  scrambleRadius={0.1}
                  clickEffect="wave"
                  intro
                />
              </div>
            )}
            <div className="mb-2 flex items-center justify-between gap-2 relative">
              <h3 className="heading">{plan.title}</h3>
            </div>
            <p className="subheading text-xl!">{plan.description}</p>
            <div className="my-14 relative">
              <p className="text-5xl font-light tracking-tighter">
                ${plan.price}
                <span className="ml-2 text-[14px] font-normal tracking-normal text-muted-foreground">
                  / month
                </span>
              </p>
              <p className="text-[14px] text-muted-foreground mt-3">
                {plan.price
                  ? "Billed monthly. Find your own pace."
                  : "Free. For as long as you like."}
              </p>
            </div>
            <ul className="mb-9 space-y-4 relative">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className={cn(
                    "flex items-start gap-2.5 subheading text-xl!",
                    plan.popular && "text-primary!"
                  )}
                >
                  <IconCircleCheckFilled className="fill-sky-400 size-6" />
                  {feature}
                </li>
              ))}
            </ul>
            {!session?.user ? (
              <Button
                className="mt-auto w-full relative"
                variant={plan.popular ? "primary" : "secondary"}
                nativeButton={false}
                render={<Link to={`/register?plan=${plan.id}`} />}
                disabled={isPending}
              >
                {plan.cta}
                <Icon name="arrow" />
              </Button>
            ) : plan.id === "free" && !manageSubscription ? (
              <Button
                className="relative mt-auto w-full"
                variant="secondary"
                nativeButton={false}
                render={<Link to="/dashboard" />}
              >
                Your workspace <Icon name="arrow" />
              </Button>
            ) : (
              <Button
                className="relative mt-auto w-full"
                variant={plan.popular ? "primary" : "secondary"}
                disabled={!subscription.isSuccess || billing.isPending}
                onClick={() => billing.mutate(plan.id)}
              >
                {billing.isPending
                  ? "Opening billing…"
                  : manageSubscription
                    ? "Manage plan"
                    : `Choose ${plan.title}`}
                <Icon name="external" />
              </Button>
            )}
          </FrameBox>
        ))}
      </div>
    </LandingSection>
  );
}

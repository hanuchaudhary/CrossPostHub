import { Link } from "react-router";

import { useMutation, useQuery } from "@tanstack/react-query";

import { getPlan } from "@repo/shared/pricing";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { QueryState } from "@/components/workspace/common";
import { errorMessage, openBillingPortal } from "@/lib/api";
import { queries } from "@/lib/query";
import { toast } from "@/lib/toast";

import { UsageMeter } from "./usage-meter";

export function BillingDetails() {
  const subscription = useQuery(queries.subscription());
  const usage = useQuery(queries.billingUsage());
  const portal = useMutation({
    mutationFn: openBillingPortal,
    onError: (error) => toast.error(errorMessage(error)),
  });
  const plan = getPlan(subscription.data?.subscription?.planId);
  const paid = plan.price > 0;

  return (
    <div className="space-y-10">
      <QueryState
        loadingLabel="Loading billing details"
        pending={subscription.isPending}
        error={subscription.error}
        retry={() => subscription.refetch()}
      />
      {subscription.isSuccess && (
        <section aria-labelledby="billing-heading" className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="mb-3 subheading text-sm! text-muted-foreground">
                {paid && subscription.data.status !== "active"
                  ? "Your subscription"
                  : "Your current plan"}
              </p>
              <div className="flex items-center gap-3">
                <h2
                  id="billing-heading"
                  className="text-3xl font-light tracking-tight"
                >
                  {plan.title}
                </h2>
                <Badge variant="secondary">
                  {paid ? subscription.data.status : "Free forever"}
                </Badge>
              </div>
              <p className="mt-3 subheading text-sm! text-muted-foreground">
                {plan.description}
              </p>
            </div>
            <p className="text-4xl font-light tracking-tighter">
              ${plan.price}
              <span className="ml-1 text-sm font-normal tracking-normal text-muted-foreground">
                / month
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {paid && (
              <Button
                variant="primary"
                disabled={portal.isPending}
                onClick={() => portal.mutate()}
              >
                {portal.isPending ? "Opening billing…" : "Manage plan"}{" "}
                <Icon name="external" />
              </Button>
            )}
            <Button
              variant="secondary"
              nativeButton={false}
              render={<Link to="/pricing" />}
            >
              Compare plans <Icon name="arrow" />
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {paid
              ? "Manage your subscription, payment details, and invoices in the Dodo Payments billing portal."
              : "No payment details needed. More room is here whenever you need it."}
          </p>
          {paid &&
            subscription.data.status === "active" &&
            subscription.data.subscription?.nextBillingAt && (
              <p className="text-sm text-muted-foreground">
                Next billing date:{" "}
                {new Date(
                  subscription.data.subscription.nextBillingAt
                ).toLocaleDateString([], {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
        </section>
      )}
      <section aria-labelledby="usage-heading" className="border-t pt-8">
        <header className="mb-8 space-y-2">
          <h2 id="usage-heading" className="text-2xl font-light tracking-tight">
            A little check on your usage.
          </h2>
          <p className="text-sm text-muted-foreground">
            {usage.isSuccess
              ? `Your monthly allowance resets ${new Date(usage.data.resetsAt).toLocaleDateString([], { day: "numeric", month: "long", timeZone: "UTC" })} (UTC).`
              : "Your publishing activity this month."}
          </p>
        </header>
        <QueryState
          loadingLabel="Loading plan usage"
          pending={usage.isPending}
          error={usage.error}
          retry={() => usage.refetch()}
        />
        {usage.isSuccess && (
          <div className="space-y-8">
            {paid && usage.data.planId !== plan.id && (
              <p className="text-sm text-muted-foreground">
                Your usage currently follows the{" "}
                {getPlan(usage.data.planId).title} allowance. Open Manage plan
                to review your subscription.
              </p>
            )}
            <UsageMeter label="Posts created" {...usage.data.posts} />
            <UsageMeter
              label="Scheduled posts created"
              {...usage.data.scheduled}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Each channel you publish to counts as one post. Scheduled posts
              also count toward your total posts allowance.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

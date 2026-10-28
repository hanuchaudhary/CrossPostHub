import { Link } from "react-router";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { QueryState } from "@/components/workspace/common";
import { queries } from "@/lib/query";

export function BillingDetails() {
  const subscription = useQuery(queries.subscription());
  return (
    <section aria-labelledby="billing-heading">
      <QueryState
        pending={subscription.isPending}
        error={subscription.error}
        retry={() => subscription.refetch()}
      />
      {subscription.isSuccess && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-medium tracking-tight">
              {subscription.data.subscription?.plan.title || "Free"}
            </h3>
            <Badge
              variant={
                subscription.data.status === "active" ? "default" : "secondary"
              }
            >
              {subscription.data.status === "none"
                ? "Free"
                : subscription.data.status}
            </Badge>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">
            {subscription.data.status === "active"
              ? "Your subscription is active."
              : "You are currently on the free plan. Compare the available plans whenever you need more publishing capacity."}
          </p>
          <dl className="grid grid-cols-2 gap-px border bg-border">
            <div className="bg-background p-4">
              <dt className="text-xs text-muted-foreground">Plan</dt>
              <dd className="mt-2 text-sm font-medium">
                {subscription.data.subscription?.plan.title || "Free"}
              </dd>
            </div>
            <div className="bg-background p-4">
              <dt className="text-xs text-muted-foreground">
                Billing schedule
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {subscription.data.subscription?.nextBillingAt
                  ? new Date(
                      subscription.data.subscription.nextBillingAt
                    ).toLocaleDateString([], {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : subscription.data.status === "active"
                    ? "No upcoming date available"
                    : "No recurring subscription"}
              </dd>
            </div>
          </dl>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/#pricing" />}
          >
            Compare plans <Icon name="external" />
          </Button>
        </div>
      )}
    </section>
  );
}

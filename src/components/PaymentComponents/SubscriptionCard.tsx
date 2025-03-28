"use client";

import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionType } from "@/Types/Types";
import Link from "next/link";

interface SubscriptionCardProps {
  subscription?: SubscriptionType | null;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <Card className="overflow-hidden border bg-background">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold">Current Subscription</h3>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {subscription?.plan?.title || "No active plan"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    subscription?.status === "active" ? "success" : "outline"
                  }
                  className="capitalize"
                >
                  {subscription?.status || "inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next billing</span>
                <span className="font-medium">
                  {subscription?.nextBillingAt
                    ? format(
                        new Date(subscription.nextBillingAt),
                        "MMM dd, yyyy"
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subscription ID</span>
                <span className="font-mono text-xs">
                  {subscription?.razorpaySubscriptionId || "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div>
              <h4 className="font-medium">Subscription Benefits</h4>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {subscription?.plan?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                )) || (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Upgrade to access premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Cancel anytime
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div className="flex justify-end">
              {subscription?.status != "active" && (
                <Link href="/upgrade">
                  <Button>
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

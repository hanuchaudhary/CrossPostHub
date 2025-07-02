"use client";

import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionType } from "@/Types/Types";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

interface SubscriptionCardProps {
  subscription?: SubscriptionType | null;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const isPremium = subscription?.plan?.title === "Premium";

  if (!subscription) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Active Subscription</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upgrade to a premium plan to unlock all features
              </p>
            </div>
            <Link href="/upgrade">
              <Button className="mt-4">
                Choose a Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${subscription.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <h3 className="text-xl font-semibold">Current Subscription</h3>
            </div>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span
                  className={`font-ClashDisplayMedium text-lg ${
                    isPremium ? "text-yellow-500" : "text-emerald-500"
                  }`}
                >
                  {subscription?.plan?.title || "Unknown Plan"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
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
                <span className="text-sm text-muted-foreground">Next billing</span>
                <span className="font-medium text-sm">
                  {subscription?.nextBillingAt
                    ? format(
                        new Date(subscription.nextBillingAt),
                        "MMM dd, yyyy"
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subscription ID</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {subscription?.razorpaySubscriptionId ? 
                    `...${subscription.razorpaySubscriptionId.slice(-8)}` : 
                    "N/A"
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div>
              <h4 className="font-medium mb-3">Plan Features</h4>
              <div className="space-y-2">
                {subscription?.plan?.features?.length ? (
                  subscription.plan.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Image
                        height={16}
                        width={16}
                        src="/PricingTick.svg"
                        alt="Feature checkmark"
                        className="flex-shrink-0 mt-0.5"
                      />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">Premium features included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">Cancel anytime</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              {subscription?.status !== "active" && (
                <Link href="/upgrade">
                  <Button variant="default" size="sm" className="w-full sm:w-auto">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
              <Link href="/upgrade">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Manage Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useLatestSubscription } from "@/hooks/useLatestSubscription";

export default function RenewalPrompt() {
  const { subscriptionStatus } = useLatestSubscription();

  if (subscriptionStatus === "expired") {
    toast({
      title: "Subscription Expired",
      description:
        "Your subscription has expired. Please renew to continue using premium features.",
      action: (
        <Link href="/upgrade">
          <Button size={"sm"} variant="default">
            Renew Now
          </Button>
        </Link>
      ),
    });
  }

  return null;
}

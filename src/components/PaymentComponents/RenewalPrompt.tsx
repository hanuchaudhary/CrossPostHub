"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function RenewalPrompt() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await axios.get("/api/payment/subscription/");
        const { status } = response.data;
        console.log("Subscription status:", status);
        
        setSubscriptionStatus(status);
        if (status === "expired") {
          toast({
            title: "Subscription Expired",
            description:
              "Your subscription has expired. Please renew to continue using premium features.",
            action: (
              <Link href="/upgrade">
                <Button size={"sm"} variant="default">Renew Now</Button>
              </Link>
            ),
            // duration: 2000, // 2 seconds
          });
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkSubscriptionStatus();
  }, []);

  return null;
}

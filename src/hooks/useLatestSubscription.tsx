import { SubscriptionType } from "@/Types/Types";
import React from "react";

export const useLatestSubscription = () => {
  const [subscription, setSubscription] =
    React.useState<SubscriptionType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<
    string | null
  >(null);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/payment/subscription/");
      const data = await response.json();
      setSubscriptionStatus(data.status);
      setSubscription(data.subscription);
      setLoading(false);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  React.useEffect(() => {
    fetchSubscription();
  }, []);

  return { subscription, loading, subscriptionStatus };
};

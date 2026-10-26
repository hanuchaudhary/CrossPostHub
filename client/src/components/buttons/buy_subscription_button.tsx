
import axios, { AxiosError } from "axios";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth.client";

export default function BuySubscriptionButton({
  buttonTitle,
  planId,
}: {
  planId: string;
  price: number;
  buttonTitle: string;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { data } = authClient.useSession();
  const navigate = useNavigate();

  const handleSubscription = async () => {
    if (!data?.user) {
      toast.error("Please login to continue");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/payment/subscribe", {
        planId,
      });

      const { checkout_url } = response.data;

      if (!checkout_url) {
        toast.error("Subscription failed", {
          description: response.data.error || "Failed to initiate subscription. Please try again.",
        });
        navigate("/payment/failed");
        return;
      }

      window.location.href = checkout_url;
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error("Subscription failed", {
          description: error.response?.data.error || "Failed to initiate subscription. Please try again.",
        });
      }
      console.error(error);
      //navigate("/payment/failed");
    } finally {
      setIsLoading(false);
    }
  };

  return <Button onClick={handleSubscription} disabled={isLoading}>{isLoading ? "Upgrading..." : buttonTitle}</Button>;
}

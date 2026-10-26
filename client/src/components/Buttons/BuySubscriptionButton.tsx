
import axios, { AxiosError } from "axios";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import Link from "@/lib/router-compat";
import { useRouter } from "@/lib/router-compat";
import { customToast } from "../CreatePost/customToast";

export default function BuySubscriptionButton({
  buttonTitle,
  planId,
}: {
  planId: string;
  price: number;
  buttonTitle: string;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { data } = useSession();
  const router = useRouter();

  const handleSubscription = async () => {
    if (!data?.user) {
      toast({
        title: "Please login to continue",
        description: "You need to login to continue.",
        action: (
          <Link href="/signin">
            <Button variant={"default"} size={"sm"}>
              Login
            </Button>
          </Link>
        ),
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/payment/subscribe", {
        planId,
      });

      const { checkout_url } = response.data;

      if (!checkout_url) {
        customToast({
          title: "Subscription failed",
          description:
            response.data.error ||
            "Failed to initiate subscription. Please try again.",
          badgeVariant: "destructive",
        });
        router.push("/payment/failed");
        return;
      }

      window.location.href = checkout_url;
    } catch (error) {
      if (error instanceof AxiosError) {
        customToast({
          title: "Subscription failed",
          description:
            error.response?.data.error ||
            "Failed to initiate subscription. Please try again.",
          badgeVariant: "destructive",
        });
      }
      console.error(error);
      // router.push("/payment/failed");
    } finally {
      setIsLoading(false);
    }
  };

  return <Button onClick={handleSubscription} disabled={isLoading}>{isLoading ? "Upgrading..." : buttonTitle}</Button>;
}

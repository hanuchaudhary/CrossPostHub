"use client";

import axios from "axios";
import React from "react";
import { Button } from "../ui/button";
import Script from "next/script";
import { createOrderId } from "@/utils/Payment/CreateOrderId";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function BuySubscriptionButton({
  price,
  buttonTitle,
  planId,
}: {
  planId: string;
  price: number;
  buttonTitle: string;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { data } = useSession();

  const handlePayment = async () => {
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
      const orderId: string = await createOrderId(price, "INR", planId);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: price * 100,
        currency: "INR",
        name: "CrossPostHub",
        description: "Payment for subscription",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const paymentResponse = await axios.post(
              "/api/payment/verifyOrder",
              {
                planId,
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (paymentResponse.data.success) {
              toast({
                title: "Payment successful",
                description: "Your subscription has been updated.",
              });
            } else {
              toast({
                title: "Payment failed",
                description:
                  "Payment verification failed. Please contact support.",
              });
            }
            console.log(paymentResponse.data);
          } catch (error) {
            toast({
              title: "Payment failed",
              description:
                "Payment verification failed. Please contact support.",
            });

            console.error(error);
          }
        },
        prefill: {
          name: data?.user.name,
          email: data?.user.email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        toast({
          title: "Payment Failed",
          description:
            response.error.description || "Payment failed. Please try again.",
        });
        console.error(response.error);
      });
      razorpay.open();
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to process payment. Please try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handlePayment} disabled={isLoading}>
        {isLoading ? "Upgrading..." : buttonTitle}
      </Button>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </>
  );
}

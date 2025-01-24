import axios from "axios";
import React from "react";
import { Button } from "../ui/button";

export default function BuySubscriptionButton({
  price,
  buttonTitle,
}: {
  price: number;
  buttonTitle: string;
}) {
  const handlePayment = async () => {
    try {
      const response = await axios.post("/api/payment/createOrder", {
        amount: price * 100,
        currency: "INR",
      });

      const order = response.data.order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "CrossPostHub",
        description: "Payment for subscription",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const paymentResponse = await axios.post(
              "/api/payment/verifyOrder",
              {
                order_id: order.id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }
            );

            console.log(paymentResponse.data);
          } catch (error) {
            console.log(error);
          }
        },
        prefill: {
          name: "Kush Chaudhary",
          email: "kush@example.com",
          contact: "1234567890",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
    }
  };
  return <Button onClick={handlePayment}>{buttonTitle}</Button>;
}

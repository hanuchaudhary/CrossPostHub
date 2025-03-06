"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ChevronRight, Download, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PaymentSuccessPage() {
  // Mock transaction data - in a real app, this would come from your database
  const transaction = {
    id: "cuid123",
    order_id: "ORD-12345678",
    amount: 2999,
    plan: {
      name: "Premium Plan",
      duration: "Monthly",
      features: ["Unlimited access", "Priority support", "Advanced analytics"],
    },
    createdAt: new Date(),
  };

  // Animation for confetti effect
  useEffect(() => {
    const createConfetti = () => {
      const confettiCount = 200;
      const colors = ["#FFC700", "#FF0066", "#2563EB", "#10B981", "#8B5CF6"];

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        confetti.style.top = -10 + "px";
        confetti.style.width = Math.random() * 10 + 5 + "px";
        confetti.style.height = Math.random() * 10 + 5 + "px";
        confetti.style.opacity = ((Math.random() * 5 + 5) / 10).toString();
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.getElementById("confetti-container")?.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }
    };

    createConfetti();

    return () => {
      const container = document.getElementById("confetti-container");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background flex flex-col items-center justify-center p-4">
      <style jsx global>{`
        .confetti {
          position: fixed;
          z-index: 100;
          animation: fall 3s linear forwards;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>

      <div
        id="confetti-container"
        className="fixed inset-0 pointer-events-none"
      ></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="w-full max-w-md"
      >
        <Card className="border-green-200 dark:border-green-800 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                }}
                className="rounded-full bg-green-100 dark:bg-green-900 p-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  }}
                  className="rounded-full bg-green-200 dark:bg-green-800 p-3"
                >
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </motion.div>
              </motion.div>
            </div>
            <CardTitle className="text-center text-2xl">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-center">
              Your transaction has been completed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="rounded-lg bg-muted p-4 space-y-3"
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{transaction.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {transaction.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${(transaction.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{transaction.plan.name}</span>
              </div>
            </motion.div>

            <Separator />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="font-medium mb-2">Plan Features:</h3>
              <ul className="space-y-2">
                {transaction.plan.features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" asChild>
              <Link href="/transactions">
                <ChevronRight className="mr-2 h-4 w-4" />
                View All Transactions
              </Link>
            </Button>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Receipt
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

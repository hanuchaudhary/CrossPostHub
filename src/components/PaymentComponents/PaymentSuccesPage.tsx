"use client";

import { useCallback, useEffect, useState } from "react";
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
import confetti from "canvas-confetti";
import { usePricingStore } from "@/store/PricingStore/usePricingStore";
import { useSearchParams } from "next/navigation";
import PageLoader from "../Loaders/PageLoader";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ReceiptTemplate } from "./Reciept";

export default function PaymentSuccessPage() {
  const {
    fetchSingleTransaction,
    singleTransaction,
    isFetchingSingleTransaction,
  } = usePricingStore();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchTransaction = useCallback(() => {
    if (orderId) {
      fetchSingleTransaction(orderId).then(() => setIsDataLoaded(true));
    }
  }, [orderId, fetchSingleTransaction]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  useEffect(() => {
    if (isDataLoaded) {
      const end = Date.now() + 3 * 1000; // 3 seconds
      const colors = [
        "#a786ff",
        "#fd8bbc",
        "#eca184",
        "#f8deb1",
        "#ff0000",
        "#00ff00",
        "#ffff00",
        "#0000ff",
        "#ffa500",
      ];

      const frame = () => {
        if (Date.now() > end) return;

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
        });

        requestAnimationFrame(frame);
      };

      frame();
    }
  }, [isDataLoaded]);

  if (isFetchingSingleTransaction || !singleTransaction) {
    return <PageLoader loading={isFetchingSingleTransaction} />;
  }

  const handleDownloadReceipt = () => {
    const receiptElement = document.getElementById("receipt");

    if (receiptElement) {
      html2canvas(receiptElement).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("receipt.pdf");
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
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
        <Card className="border-none shadow-none">
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
                <span className="font-medium">
                  {singleTransaction?.order_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {new Date(
                    singleTransaction?.createdAt ?? ""
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${(Number(singleTransaction?.amount) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {singleTransaction?.plan.title}
                </span>
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
                {singleTransaction?.plan.features.map((feature, index) => (
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
              <Link href="/payment/transactions">
                <ChevronRight className="mr-2 h-4 w-4" />
                View All Transactions
              </Link>
            </Button>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Receipt
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="hidden">
        <ReceiptTemplate transaction={singleTransaction} />
      </div>
    </div>
  );
}

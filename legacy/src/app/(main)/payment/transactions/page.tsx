import TransactionsPage from "@/components/PaymentComponents/TransactionsPage";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Transactions | CrossPostHub",
  description: "View your transactions and payment history on CrossPostHub.",
};

export default function Page() {
  return <TransactionsPage/>
}

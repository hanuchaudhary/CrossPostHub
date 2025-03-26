import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Assuming you're using shadcn/ui or similar
import { TransactionType } from "@/Types/Types";
import React from "react";
import { Badge } from "../ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

export const TransactionDetailsModal = ({
  transaction,
  children,
}: {
  transaction: TransactionType;
  children: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-medium">{transaction.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan:</span>
            {/* <span className="font-medium">{transaction.plan.title}</span> */}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">
              ${(Number(transaction.amount) / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge
              variant={
                transaction.status === "SUCCESS"
                  ? "success"
                  : transaction.status === "PENDING"
                  ? "pending"
                  : "destructive"
              }
              className="flex w-fit items-left gap-1"
            >
              {transaction.status === "SUCCESS" && (
                <CheckCircle2 className="h-3 w-3" />
              )}
              {transaction.status === "PENDING" && (
                <Clock className="h-3 w-3" />
              )}
              {transaction.status === "FAILED" && (
                <XCircle className="h-3 w-3" />
              )}
              {transaction.status}
            </Badge>
          </div>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Plan Features:</h3>
            <ul className="space-y-1">
              {/* {transaction.plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))} */}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

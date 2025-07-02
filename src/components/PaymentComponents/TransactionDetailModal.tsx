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
            <span className="font-medium">
              {transaction.subscription?.plan?.title || "N/A"}
            </span>
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
              className="flex w-fit items-center gap-1"
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
              <span className="capitalize">
                {transaction.status.toLowerCase()}
              </span>
            </Badge>
          </div>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Plan Features:</h3>
            {transaction.subscription?.plan?.features?.length ? (
              <ul className="space-y-1">
                {transaction.subscription.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No features available for this plan.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

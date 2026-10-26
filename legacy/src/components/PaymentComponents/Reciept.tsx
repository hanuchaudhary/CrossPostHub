import { TransactionType } from "@/Types/Types";
import { CheckCircle } from "lucide-react";

export const ReceiptTemplate = ({ transaction }: { transaction: TransactionType }) => {
  return (
    <div id="receipt" className="p-4 bg-primary text-primary-foreground shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-center mb-4">Payment Receipt</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order ID:</span>
          <span className="font-medium">{transaction?.order_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">
            {new Date(transaction?.createdAt ?? "").toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-medium">
            ${(Number(transaction?.amount) / 100).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Plan:</span>
          <span className="font-medium">{transaction?.subscription.plan.title}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-medium mb-2">Plan Features:</h3>
        <ul className="space-y-1">
          {transaction?.subscription.plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Thank you for your purchase!
      </div>
    </div>
  );
};

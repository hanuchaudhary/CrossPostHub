"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionStore } from "@/store/PricingStore/useSubscriptionStore";
import PageLoader from "../Loaders/PageLoader";
import { TransactionDetailsModal } from "./TransactionDetailModal";
import UpgradeButton from "../Buttons/UpgradeButton";
import { SubscriptionCard } from "./SubscriptionCard";

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");

  const {
    fetchTransactions,
    transactions,
    isFetchingTransactions,
    subscription,
  } = useSubscriptionStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions
    ?.filter((transaction) => {
      if (statusFilter === "ALL") {
        return transaction;
      }
      return transaction.status === statusFilter;
    })
    ?.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  if (isFetchingTransactions || !transactions) {
    return <PageLoader loading={isFetchingTransactions} />;
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="font-ClashDisplayMedium tracking-wide">
          <h1 className="text-3xl">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your payment transactions.
          </p>
        </div>

        {/* Current Subscription Card */}
        <SubscriptionCard subscription={subscription} />

        {transactions?.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="h-96 flex items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No transactions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your payment history will appear here once you make your first purchase.
                  </p>
                </div>
                <div className="pt-4">
                  <UpgradeButton />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Transactions Table */
          <Card className="shadow-none border-none">
            <CardContent className="p-0 border-none shadow-none">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Filter by status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="SUCCESS">Completed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                      }
                      title={
                        sortOrder === "desc" ? "Newest first" : "Oldest first"
                      }
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-left min-w-[120px]">Date</TableHead>
                        <TableHead className="text-left min-w-[140px]">Order ID</TableHead>
                        <TableHead className="text-left min-w-[100px]">Plan</TableHead>
                        <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                        <TableHead className="text-center min-w-[120px]">Status</TableHead>
                        <TableHead className="text-center min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions?.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`border-b transition-colors hover:bg-muted/50 ${
                            index % 2 === 0
                              ? "bg-muted/20"
                              : "bg-background"
                          }`}
                        >
                          <TableCell className="text-left font-mono text-sm">
                            {format(transaction.createdAt, "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-left font-mono text-sm">
                            <span className="truncate max-w-[120px] inline-block">
                              {transaction.order_id}
                            </span>
                          </TableCell>
                          <TableCell className="text-left">
                            <span className="font-medium">
                              {transaction.subscription?.plan?.title || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${Number(Number(transaction.amount) / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                transaction.status === "SUCCESS"
                                  ? "success"
                                  : transaction.status === "PENDING"
                                    ? "pending"
                                    : "destructive"
                              }
                              className="flex w-fit items-center gap-1 mx-auto"
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
                              <span className="capitalize text-xs">
                                {transaction.status.toLowerCase()}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <TransactionDetailsModal transaction={transaction}>
                              <Button variant="ghost" size="sm" className="text-xs">
                                View Details
                              </Button>
                            </TransactionDetailsModal>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredTransactions?.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">
                                {transaction.subscription?.plan?.title || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {transaction.order_id}
                              </p>
                            </div>
                            <Badge
                              variant={
                                transaction.status === "SUCCESS"
                                  ? "success"
                                  : transaction.status === "PENDING"
                                    ? "pending"
                                    : "destructive"
                              }
                              className="flex items-center gap-1"
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
                              <span className="capitalize text-xs">
                                {transaction.status.toLowerCase()}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-semibold">
                                ${Number(Number(transaction.amount) / 100).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(transaction.createdAt, "MMM dd, yyyy")}
                              </p>
                            </div>
                            <TransactionDetailsModal transaction={transaction}>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </TransactionDetailsModal>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

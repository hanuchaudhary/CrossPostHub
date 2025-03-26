"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  XCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import PostNotification from "../Tools/EmailTemplate";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");

  const { fetchTransactions, transactions, isFetchingTransactions } =
    useSubscriptionStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions
    ?.filter((transaction) => {
      if (statusFilter !== "ALL" && transaction.status !== statusFilter) {
        return false;
      }

      const searchLower = searchTerm.toLowerCase();
      return transaction?.order_id?.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  // Show loading state while fetching transactions
  if (isFetchingTransactions || !transactions) {
    return <PageLoader loading={isFetchingTransactions} />;
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {filteredTransactions?.length === 0 ? (
        <div className="h-96 flex items-center justify-center">
          <div className="select-none text-muted-foreground h-24 flex flex-col items-center justify-center font-ClashDisplayMedium group">
            <p className="mb-2 text-lg group-hover:text-emerald-100/70 transition-colors duration-300">
              No transactions found.
            </p>
            <p className="text-lg border-2 border-secondary/50 rounded-3xl p-4 space-x-4 group-hover:text-emerald-100/50 group-hover:border-emerald-100/50 transition-colors duration-300">
              <UpgradeButton /> <span>to view transactions.</span>
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              View and manage all your payment transactions.
            </p>
          </div>

          {/* Transactions Table */}
          <Card className="shadow-none border-none">
            <CardContent className="p-0 border-none shadow-none">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-left gap-2">
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

                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-100 dark:bg-neutral-800">
                        <TableHead className="text-left">Date</TableHead>
                        <TableHead className="text-left">Order ID</TableHead>
                        <TableHead className="text-left">Plan</TableHead>
                        <TableHead className="text-left">Amount</TableHead>
                        <TableHead className="text-left">Status</TableHead>
                        <TableHead className="text-left">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions?.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`border-b transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                            index % 2 === 0
                              ? "bg-neutral-50 dark:bg-neutral-900"
                              : ""
                          }`}
                        >
                          <TableCell className="text-left">
                            {format(transaction.createdAt, "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-left">
                            {transaction.order_id}
                          </TableCell>
                          <TableCell className="text-left">
                            {/* {transaction.plan.title} */}
                          </TableCell>
                          <TableCell className="text-left font-medium">
                            $
                            {Number(Number(transaction.amount) / 100).toFixed(
                              2
                            )}
                          </TableCell>
                          <TableCell className="text-left">
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
                          </TableCell>
                          <TableCell className="text-left">
                            <TransactionDetailsModal transaction={transaction}>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </TransactionDetailsModal>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
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

// Mock data based on the transaction schema
const transactions = [
  {
    id: "cuid1",
    userId: "user1",
    planId: "plan1",
    status: "COMPLETED",
    amount: 2999,
    order_id: "order1",
    user: { name: "John Doe", email: "john@example.com" },
    plan: { name: "Premium Plan", duration: "Monthly" },
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2023, 5, 15),
  },
  {
    id: "cuid2",
    userId: "user2",
    planId: "plan2",
    status: "PENDING",
    amount: 4999,
    order_id: "order2",
    user: { name: "Jane Smith", email: "jane@example.com" },
    plan: { name: "Business Plan", duration: "Annual" },
    createdAt: new Date(2023, 5, 14),
    updatedAt: new Date(2023, 5, 14),
  },
  {
    id: "cuid3",
    userId: "user3",
    planId: "plan1",
    status: "FAILED",
    amount: 2999,
    order_id: "order3",
    user: { name: "Robert Johnson", email: "robert@example.com" },
    plan: { name: "Premium Plan", duration: "Monthly" },
    createdAt: new Date(2023, 5, 13),
    updatedAt: new Date(2023, 5, 13),
  },
  {
    id: "cuid4",
    userId: "user4",
    planId: "plan3",
    status: "COMPLETED",
    amount: 9999,
    order_id: "order4",
    user: { name: "Emily Davis", email: "emily@example.com" },
    plan: { name: "Enterprise Plan", duration: "Annual" },
    createdAt: new Date(2023, 5, 12),
    updatedAt: new Date(2023, 5, 12),
  },
  {
    id: "cuid5",
    userId: "user5",
    planId: "plan2",
    status: "COMPLETED",
    amount: 4999,
    order_id: "order5",
    user: { name: "Michael Wilson", email: "michael@example.com" },
    plan: { name: "Business Plan", duration: "Annual" },
    createdAt: new Date(2023, 5, 11),
    updatedAt: new Date(2023, 5, 11),
  },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      // Apply status filter
      if (statusFilter !== "ALL" && transaction.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.user.name.toLowerCase().includes(searchLower) ||
        transaction.user.email.toLowerCase().includes(searchLower) ||
        transaction.order_id.toLowerCase().includes(searchLower) ||
        transaction.plan.name.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by date
      return sortOrder === "desc"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime();
    });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col space-y-6"
      >
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your payment transactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              A list of all transactions processed through your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {filteredTransactions.map((transaction) => (
                          <motion.tr
                            key={transaction.id}
                            variants={itemVariants}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <TableCell className="font-medium">
                              {format(transaction.createdAt, "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>{transaction.order_id}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{transaction.user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {transaction.user.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{transaction.plan.name}</TableCell>
                            <TableCell>
                              ${(transaction.amount / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === "COMPLETED"
                                    ? "success"
                                    : transaction.status === "PENDING"
                                    ? "outline"
                                    : "destructive"
                                }
                                className="flex w-fit items-center gap-1"
                              >
                                {transaction.status === "COMPLETED" && (
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
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/transactions/${transaction.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </motion.div>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

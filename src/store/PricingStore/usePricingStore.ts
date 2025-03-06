import { Plan } from "@/Types/Types";
import { Transaction } from "@prisma/client";
import axios from "axios";
import { create } from "zustand";

interface PricingStore {
  fetchPricingPlans: VoidFunction;
  isFetchingPlans: boolean;
  pricingPlans: Plan[] | null;

  fetchTransactions: VoidFunction;
  isFetchingTransactions: boolean;
  transactions: Transaction[] | null;
}

export const usePricingStore = create<PricingStore>((set) => ({
  isFetchingPlans: true,
  pricingPlans: null,
  fetchPricingPlans: async () => {
    try {
      const { data } = await axios.get("/api/payment/pricing");
      set({ pricingPlans: data.pricingPlans });
    } catch (error: any) {
      console.error("Fetch Pricing Plan Error:", error);
    } finally {
      set({ isFetchingPlans: false });
    }
  },

  isFetchingTransactions: true,
  transactions: null,
  fetchTransactions: async () => {
    try {
      const { data } = await axios.get("/api/payment");
      set({ transactions: data.transactions });
    } catch (error: any) {
      console.error("Fetch Transactions Error:", error);
    } finally {
      set({ isFetchingTransactions: false });
    }
  },
}));

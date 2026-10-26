import { Plan, SubscriptionType, TransactionType } from "@/Types/Types";
import axios from "axios";
import { create } from "zustand";

interface SubscriptionStore {
  fetchPricingPlans: VoidFunction;
  isFetchingPlans: boolean;
  pricingPlans: Plan[] | null;

  fetchTransactions: VoidFunction;
  isFetchingTransactions: boolean;
  transactions: TransactionType[] | null;
  subscription: SubscriptionType | null;

  fetchSingleTransaction: (order_id: string) => Promise<void>;
  isFetchingSingleTransaction: boolean;
  singleTransaction: TransactionType | null;

  creditCount: number;
  setCreditCount: (count: number) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({

  creditCount: 68,
  setCreditCount: (count: number) => set({ creditCount: count }),

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
  subscription: null,
  fetchTransactions: async () => {
    try {
      const { data } = await axios.get("/api/payment");
      set({
        transactions: data.transactions,
        subscription: data.subscriptions[0],
      });
    } catch (error: any) {
      console.error("Fetch Transactions Error:", error);
    } finally {
      set({ isFetchingTransactions: false });
    }
  },

  isFetchingSingleTransaction: false,
  singleTransaction: null,
  fetchSingleTransaction: async (order_id: string) => {
    set({ isFetchingSingleTransaction: true });
    try {
      const { data } = await axios.post("/api/payment", { order_id });
      set({ singleTransaction: data.transaction });
    } catch (error: any) {
      console.error("Fetch Single Transaction Error:", error);
    } finally {
      set({ isFetchingSingleTransaction: false });
    }
  },
}));

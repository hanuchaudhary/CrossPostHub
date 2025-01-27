import { Plan } from "@/Types/Types";
import axios from "axios";
import { create } from "zustand";

interface PricingStore {
    fetchPricingPlans: VoidFunction;
    isFetchingPlans: boolean;
    pricingPlans: Plan[] | null;
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
}));
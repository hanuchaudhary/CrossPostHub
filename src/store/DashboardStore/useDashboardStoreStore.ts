import { ConnectedApp, TwitterUser } from "@/Types/Types";
import axios from "axios";
import { create } from "zustand";

interface DashboardStoreProps {
  isFetchingApps: boolean;
  connectedApps: ConnectedApp[];
  fetchConnectedApps: () => Promise<void>;

  twitterUserDetails: TwitterUser | null;
  fetchAccountDetails: VoidFunction;

  dashboardData: any;
  fetchDashboardData: VoidFunction;
  isFetchingDashboardData: boolean;
}

export const useDashboardStore = create<DashboardStoreProps>((set, get) => ({
  isFetchingApps: true,
  connectedApps: [],
  fetchConnectedApps: async () => {
    try {
      const response = await axios.get("/api/get-apps");
      const data = response.data;

      set({ connectedApps: data.connectedApps, isFetchingApps: false });
    } catch (error: any) {
      console.error("Fetch Connected Apps Error:", error);
    }
  },

  twitterUserDetails: null,
  fetchAccountDetails: async () => {
    try {
      const response = await axios.get("/api/user");
      const data = response.data;
      set({ twitterUserDetails: data.twitterUserDetails });
    } catch (error: any) {
      console.error("Fetch Twitter Account Details Error:", error);
    }
  },

  dashboardData: null,
  fetchDashboardData: async () => {
    try {
      const response = await axios.post("/api/user");
      const data = response.data;
      console.log("Dashboard Data:", data);
      
      set({ dashboardData: data, isFetchingDashboardData: false });
    } catch (error: any) {
      console.error("Fetch Dashboard Data Error:", error);
    }finally{
      set({ isFetchingDashboardData: false });
    }
  },

  isFetchingDashboardData: true,
}));

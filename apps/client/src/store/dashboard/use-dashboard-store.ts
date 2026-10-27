import { ConnectedApp, TwitterUser } from "@/types/types";
import axios from "axios";
import { create } from "zustand";
import { authClient } from "@/lib/auth.client";

type monthlyData = {
  month: string;
  twitter: number;
  linkedIn: number;
  instagram: number;
};

type PostsResponse = {
  ScheduledPosts: import("@/types/types").Post[];
  PendingPosts: import("@/types/types").Post[];
  FailedPosts: import("@/types/types").Post[];
  SuccessPosts: import("@/types/types").Post[];
};

export type DashboardDataType = {
  twitterUserDetails: TwitterUser;
  monthlyData: monthlyData[];
};

interface DashboardStoreProps {
  isFetchingApps: boolean;
  connectedApps: ConnectedApp[];
  fetchConnectedApps: () => Promise<void>;

  dashboardData: DashboardDataType | null;
  fetchDashboardData: VoidFunction;
  isFetchingDashboardData: boolean;

  userPosts: PostsResponse;
  fetchPosts: ({ limit, offset}: FetchPostsParams) => Promise<void>;
}

interface FetchPostsParams {
  limit?: number;
  offset?: number;
}

export const useDashboardStore = create<DashboardStoreProps>((set, get) => ({
  isFetchingApps: true,
  connectedApps: [],
  fetchConnectedApps: async () => {
    try {
      const { data, error } = await authClient.listAccounts();
      if (error) throw new Error(error.message);
      const socialProviders = new Set(["twitter", "linkedin", "instagram", "threads"]);
      set({
        connectedApps: (data ?? []).filter((account) => socialProviders.has(account.providerId)),
        isFetchingApps: false,
      });
    } catch (error: any) {
      console.error("Fetch Connected Apps Error:", error);
      set({ connectedApps: [], isFetchingApps: false });
    }
  },

  isFetchingDashboardData: true,
  dashboardData: null,
  fetchDashboardData: async () => {
    try {
      const response = await axios.get("/api/user");
      const data = response.data;

      set({ dashboardData: data, isFetchingDashboardData: false });
    } catch (error: any) {
      console.error("Fetch Dashboard Data Error:", error);
    } finally {
      set({ isFetchingDashboardData: false });
    }
  },

  userPosts: {
    ScheduledPosts: [],
    PendingPosts: [],
    FailedPosts: [],
    SuccessPosts: [],
  },
  fetchPosts: async ({
    limit = 10,
    offset = 0,
  }: FetchPostsParams) => {
    try {
      const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      }).toString();
      const response = await fetch(`/api/post?${query}`);
      const data = await response.json();
      set({ userPosts: data });
    } catch (error) {
      console.error("Fetch posts failed:", error);
    }
  },
}));

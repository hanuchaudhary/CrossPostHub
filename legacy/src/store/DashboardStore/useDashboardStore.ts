import { PostsResponse } from "@/app/api/post/route";
import { ConnectedApp, TwitterUser } from "@/Types/Types";
import axios from "axios";
import { create } from "zustand";

type monthlyData = {
  month: string;
  twitter: number;
  linkedIn: number;
  instagram: number;
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
      const response = await axios.get("/api/get-apps");
      const data = response.data;

      set({ connectedApps: data.connectedApps, isFetchingApps: false });
    } catch (error: any) {
      console.error("Fetch Connected Apps Error:", error);
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

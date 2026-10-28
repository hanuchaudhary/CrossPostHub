import { QueryClient, queryOptions } from "@tanstack/react-query";
import {
  getAllPosts,
  getAccounts,
  getNotifications,
  getOverview,
  getSubscription,
} from "./api";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
    mutations: { retry: 0 },
  },
});
export const queryKeys = {
  posts: ["posts"] as const,
  accounts: ["accounts"] as const,
  overview: ["overview"] as const,
  notifications: ["notifications"] as const,
  subscription: ["subscription"] as const,
};
export const queries = {
  posts: () =>
    queryOptions({
      queryKey: queryKeys.posts,
      queryFn: getAllPosts,
      refetchInterval: 30_000,
    }),
  accounts: () =>
    queryOptions({ queryKey: queryKeys.accounts, queryFn: getAccounts }),
  overview: () =>
    queryOptions({ queryKey: queryKeys.overview, queryFn: getOverview }),
  notifications: () =>
    queryOptions({
      queryKey: queryKeys.notifications,
      queryFn: getNotifications,
    }),
  subscription: () =>
    queryOptions({
      queryKey: queryKeys.subscription,
      queryFn: getSubscription,
    }),
};
export const mutationKeys = {
  createPost: ["createPost"],
  profile: ["profile"],
  password: ["password"],
  disconnect: ["disconnect"],
  notificationsRead: ["notifications", "read"],
};
export const refreshPosts = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
    queryClient.invalidateQueries({ queryKey: queryKeys.overview }),
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  ]);

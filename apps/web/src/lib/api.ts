import axios from "axios";

import type { SocialConnection } from "./api/post";
import { authClient } from "./auth-client";
import { getChannel } from "./constants";
import type {
  BillingUsage,
  ConnectedAccount,
  NotificationsResponse,
  OverviewResponse,
  Post,
  PostGroups,
  PostInput,
  SubscriptionResponse,
  UploadResponse,
} from "./types";

export const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || "http://localhost:8787").replace(/\/$/, "")}/api`,
  withCredentials: true,
});
export const getPosts = async (offset = 0) =>
  (await api.get<PostGroups>("/post", { params: { limit: 50, offset } })).data;
export const getAllPosts = async () => {
  const collected = new Map<string, Post>();
  for (let offset = 0; ; offset += 50) {
    const groups = await getPosts(offset);
    const page = [
      ...new Map(
        Object.values(groups)
          .flat()
          .map((post) => [post.id, post])
      ).values(),
    ];
    page.forEach((post) => collected.set(post.id, post));
    if (page.length < 50) break;
  }
  return [...collected.values()];
};
export const createPost = async ({
  text,
  providers,
  scheduleAt,
  mediaKeys,
  platformContent,
}: PostInput) => {
  if (
    providers.some((provider) => {
      const channel = getChannel(provider);
      return !channel || channel.locked;
    })
  )
    throw new Error("A selected publishing channel is locked.");
  const form = new FormData();
  form.set("postText", text);
  form.set("providers", JSON.stringify(providers));
  form.set("mediaKeys", JSON.stringify(mediaKeys));
  if (platformContent)
    form.set("platformContent", JSON.stringify(platformContent));
  if (scheduleAt) form.set("scheduleAt", scheduleAt);
  return (await api.post("/post", form)).data;
};
export const uploadMedia = async (
  file: File,
  options: {
    signal?: AbortSignal;
    onProgress?: (percent: number) => void;
  } = {}
) => {
  const { data } = await api.post<UploadResponse>(
    "/post/preSignedUrl",
    {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    },
    { signal: options.signal }
  );
  try {
    await api.put(data.url, file, {
      headers: { "Content-Type": file.type },
      signal: options.signal,
      onUploadProgress: (event) => {
        if (event.total)
          options.onProgress?.(
            Math.min(99, Math.round((event.loaded / event.total) * 100))
          );
      },
    });
    return data.key;
  } catch (error) {
    // An aborted or failed PUT may have left a partial object. Cleanup must not
    // share the aborted signal, and must not replace the original error.
    await deleteMedia(data.key).catch(() => undefined);
    throw error;
  }
};
export const mediaUrl = (key: string) =>
  `${api.defaults.baseURL}/media/file?${new URLSearchParams({ key })}`;
export const isVideoKey = (key: string) =>
  /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(key);
export const deleteMedia = async (mediaKey: string) =>
  (await api.post("/post/delete/media", { mediaKey })).data;
export const getOverview = async () =>
  (await api.get<OverviewResponse>("/user")).data;
export const getNotifications = async () =>
  (await api.get<NotificationsResponse>("/notifications")).data.notifications;
export const markNotificationsRead = async () =>
  (await api.put("/notifications")).data;
export const getSubscription = async () =>
  (await api.get<SubscriptionResponse>("/payment/subscription")).data;
export const getBillingUsage = async () =>
  (await api.get<BillingUsage>("/payment/usage")).data;
export const openBillingPortal = async () => {
  const { data } = await api.get<{ url: string; redirect: boolean }>(
    "/auth/dodopayments/customer/portal"
  );
  if (!data.url || !data.redirect)
    throw new Error("Couldn’t open billing. Please try again.");
  window.location.assign(data.url);
};
export const startPlanCheckout = async (planId: string) => {
  const { data } = await api.post<{ checkout_url: string }>(
    "/payment/subscribe",
    { planId }
  );
  if (!data.checkout_url)
    throw new Error("Couldn’t open checkout. Please try again.");
  window.location.assign(data.checkout_url);
};
export const getAccounts = async (): Promise<ConnectedAccount[]> => {
  const { data } = await api.get<SocialConnection[]>("/post/connections");
  if (!Array.isArray(data))
    throw new Error("Couldn’t load your connections. Please try again.");
  return data.map((connection) => ({
    ...connection,
    providerId: connection.provider === "x" ? "twitter" : connection.provider,
  }));
};
export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error))
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message
    );
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const requestPasswordReset = authClient.requestPasswordReset;
export const resetPassword = authClient.resetPassword;
export const sendVerificationEmail = authClient.sendVerificationEmail;
export const verifyEmail = authClient.verifyEmail;
export const updateProfile = authClient.updateUser;
export const changePassword = authClient.changePassword;

import { getChannel } from "./constants";
import type {
  ChannelId,
  ConnectedAccount,
  Post,
  PostGroups,
  PostInput,
  UploadResponse,
  OverviewResponse,
  NotificationsResponse,
  SubscriptionResponse,
} from "./types";
import axios from "axios";
import { authClient } from "./auth-client";
export const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || "http://localhost:8787").replace(/\/$/, "")}/api`,
  withCredentials: true,
});
export const getPosts = async (offset = 0) =>
  (await api.get<PostGroups>("/post", { params: { limit: 50, offset } })).data;
// The API paginates before grouping. Read every page so a month is never silently truncated.
export const getAllPosts = async () => {
  const collected = new Map<string, Post>();
  for (let offset = 0; ; offset += 50) {
    const groups = await getPosts(offset);
    const page = [
      ...new Map(
        Object.values(groups)
          .flat()
          .map((post) => [post.id, post]),
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
  if (scheduleAt) form.set("scheduleAt", scheduleAt);
  return (await api.post("/post", form)).data;
};
export const uploadMedia = async (file: File) => {
  const { data } = await api.post<UploadResponse>("/post/preSignedUrl", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });
  await api.put(data.url, file, { headers: { "Content-Type": file.type } });
  return data.key;
};
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
export const getAccounts = async (): Promise<ConnectedAccount[]> => {
  const result = await authClient.listAccounts();
  if (result.error) throw new Error(result.error.message);
  return result.data ?? [];
};
export const connectAccount = async (provider: ChannelId) => {
  const channel = getChannel(provider);
  if (!channel || channel.locked)
    throw new Error(`${channel?.name || provider} is not available yet.`);
  const result = await authClient.linkSocial({
    provider,
    callbackURL: `${window.location.origin}/connections`,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
};
export const disconnectAccount = async (accountId: string) => {
  const result = await authClient.unlinkAccount({ accountId });
  if (result.error) throw new Error(result.error.message);
  return result.data;
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

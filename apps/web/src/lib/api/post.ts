import { api } from "../api";

export type SocialProvider = "youtube" | "instagram" | "linkedin" | "x";
export type SocialConnection = {
  id: string;
  provider: SocialProvider;
  name: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "NEEDS_REAUTH";
};
export type PostingAccess = { allowed: boolean; several: boolean };

export abstract class PostApi {
  static async connections() {
    const res = await api.get("/post/connections");
    return res.data as SocialConnection[];
  }

  static async access() {
    const res = await api.get("/post/access");
    return res.data as PostingAccess;
  }

  static async connect(provider: SocialProvider) {
    const res = await api.post(`/post/${provider}/connect`);
    window.location.assign((res.data as { url: string }).url);
  }

  static async disconnect(id: string) {
    await api.delete(`/post/connections/${id}`);
  }
}

export function apiError(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === "string" && data) return data;
  if (data && typeof data === "object" && "message" in data)
    return String(data.message);
  return fallback;
}

import { useQuery } from "@tanstack/react-query";

import { PostApi, type SocialProvider } from "@/lib/api/post";

export const CONNECTIONS_QUERY_KEY = ["post", "connections"] as const;
export const ACCESS_QUERY_KEY = ["post", "access"] as const;

export type ConnectKind = "oauth" | "bluesky" | "mastodon" | "telegram";

export type ProviderOption = {
  id: SocialProvider;
  label: string;
  icon: string;
  iconClass?: string;
  connect: ConnectKind;
  available: true;
};

const option = (
  id: SocialProvider,
  label: string,
  icon: string,
  extra: Partial<ProviderOption> = {}
): ProviderOption => ({
  id,
  label,
  icon,
  connect: "oauth",
  available: true,
  ...extra,
});

export const PROVIDERS: ProviderOption[] = [
  option("x", "X", "/x-icon.svg", { iconClass: "dark:invert" }),
  option("linkedin", "LinkedIn", "/linkedin-icon.svg"),
  option("instagram", "Instagram", "/instagram-icon.svg"),
  option("threads", "Threads", "/icons/threads-icon.svg", {
    iconClass: "invert dark:invert-0",
  }),
  option("facebook", "Facebook Page", "/icons/facebook-icon.svg"),
  option("bluesky", "Bluesky", "/icons/bluesky-icon.svg", { connect: "bluesky" }),
  option("mastodon", "Mastodon", "/icons/mastodon-icon.svg", {
    connect: "mastodon",
  }),
  option("pinterest", "Pinterest", "/icons/pinterest-icon.svg"),
  option("tiktok", "TikTok", "/icons/tiktok-icon.svg"),
  option("telegram", "Telegram channel", "/icons/telegram-icon.svg", {
    connect: "telegram",
  }),
];

export const iconInvert = (provider: { iconClass?: string }) =>
  provider.iconClass;

export function usePostingAccess() {
  const { data, isLoading } = useQuery({
    queryKey: ACCESS_QUERY_KEY,
    queryFn: () => PostApi.access(),
    staleTime: 30_000,
  });
  return {
    loading: isLoading,
    allowed: data?.allowed ?? false,
    several: data?.several ?? false,
    configured: new Set(data?.configured ?? []),
  };
}

export function useConnections(enabled = true) {
  return useQuery({
    queryKey: CONNECTIONS_QUERY_KEY,
    queryFn: () => PostApi.connections(),
    enabled,
  });
}

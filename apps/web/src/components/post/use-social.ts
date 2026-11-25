import { useQuery } from "@tanstack/react-query";

import { PostApi, type SocialProvider } from "@/lib/api/post";

export const CONNECTIONS_QUERY_KEY = ["post", "connections"] as const;
export const ACCESS_QUERY_KEY = ["post", "access"] as const;

export const PROVIDERS: {
  id: SocialProvider;
  label: string;
  icon: string;
  available: boolean;
}[] = [
  {
    id: "youtube",
    label: "YouTube Shorts",
    icon: "/youtube-icon.svg",
    available: false,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "/instagram-icon.svg",
    available: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "/linkedin-icon.svg",
    available: true,
  },
  {
    id: "x",
    label: "X",
    icon: "/x-icon.svg",
    available: true,
  },
];

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
  };
}

export function useConnections(enabled = true) {
  return useQuery({
    queryKey: CONNECTIONS_QUERY_KEY,
    queryFn: () => PostApi.connections(),
    enabled,
  });
}

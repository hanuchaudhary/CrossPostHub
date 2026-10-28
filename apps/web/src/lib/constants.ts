import type { Channel, ChannelId, Platform } from "./types";

export const CHANNELS: readonly Channel[] = [
  {
    id: "twitter",
    name: "X / Twitter",
    icon: "/icons/twitter-icon.svg",
    iconClassName: "invert dark:invert-0 size-8",
    locked: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "/icons/linkedin-icon.svg",
    locked: false,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "/icons/instagram-icon.svg",
    locked: false,
  },
  {
    id: "threads",
    name: "Threads",
    icon: "/icons/threads-icon.svg",
    iconClassName: "invert dark:invert-0",
    locked: false,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "/icons/facebook-icon.svg",
    locked: false,
  },
  {
    id: "bluesky",
    name: "Bluesky",
    icon: "/icons/bluesky-icon.svg",
    locked: false,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "/icons/pinterest-icon.svg",
    locked: false,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "/icons/tiktok-icon.svg",
    locked: false,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "/icons/youtube-icon.svg",
    locked: false,
  },
  {
    id: "github",
    name: "GitHub",
    icon: "/icons/github-icon.svg",
    iconClassName: "invert dark:invert-0",
    locked: false,
  },
];
export function getChannel(id: string) {
  return CHANNELS.find((channel) => channel.id === id);
}
export function isPublishingPlatform(id: ChannelId | string): id is Platform {
  return id === "twitter" || id === "linkedin" || id === "instagram";
}

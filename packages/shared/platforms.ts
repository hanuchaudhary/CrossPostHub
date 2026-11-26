export const PLATFORMS = [
  "twitter",
  "linkedin",
  "instagram",
  "threads",
  "facebook",
  "bluesky",
  "mastodon",
  "pinterest",
  "tiktok",
  "telegram",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export type PlatformRules = {
  name: string;
  text: number;
  captionWithMedia?: number;
  maxMedia: number;
  requiresMedia?: "any" | "image" | "video";
  imageTypes: readonly string[];
  videoTypes: readonly string[];
  maxImageBytes?: number;
  mixedMedia: boolean;
  gifAlone?: boolean;
  note: string;
};

const MB = 1024 * 1024;
const JPEG_PNG = ["image/jpeg", "image/png"] as const;
const COMMON_IMAGES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
const MP4_MOV = ["video/mp4", "video/quicktime"] as const;

export const PLATFORM_RULES: Record<Platform, PlatformRules> = {
  twitter: {
    name: "X",
    text: 280,
    maxMedia: 4,
    imageTypes: COMMON_IMAGES,
    videoTypes: ["video/mp4"],
    maxImageBytes: 5 * MB,
    mixedMedia: false,
    gifAlone: true,
    note: "Up to 280 characters, the limit for accounts without X Premium.",
  },
  linkedin: {
    name: "LinkedIn",
    text: 3000,
    maxMedia: 9,
    imageTypes: ["image/jpeg", "image/png", "image/gif"],
    videoTypes: ["video/mp4"],
    mixedMedia: false,
    note: "Posted to your profile.",
  },
  instagram: {
    name: "Instagram",
    text: 2200,
    maxMedia: 10,
    requiresMedia: "any",
    imageTypes: ["image/jpeg"],
    videoTypes: MP4_MOV,
    maxImageBytes: 8 * MB,
    mixedMedia: false,
    note: "Needs a photo or video. Posted to your feed.",
  },
  threads: {
    name: "Threads",
    text: 500,
    maxMedia: 20,
    imageTypes: JPEG_PNG,
    videoTypes: MP4_MOV,
    maxImageBytes: 8 * MB,
    mixedMedia: true,
    note: "Up to 500 characters. Several photos or videos post as a carousel.",
  },
  facebook: {
    name: "Facebook",
    text: 63206,
    maxMedia: 10,
    imageTypes: COMMON_IMAGES,
    videoTypes: MP4_MOV,
    mixedMedia: false,
    note: "Posted to your Facebook Page.",
  },
  bluesky: {
    name: "Bluesky",
    text: 300,
    maxMedia: 4,
    imageTypes: ["image/jpeg", "image/png", "image/webp"],
    videoTypes: [],
    maxImageBytes: 976 * 1024,
    mixedMedia: false,
    note: "Up to 300 characters and 4 photos under 976 KB each.",
  },
  mastodon: {
    name: "Mastodon",
    text: 500,
    maxMedia: 4,
    imageTypes: COMMON_IMAGES,
    videoTypes: MP4_MOV,
    maxImageBytes: 16 * MB,
    mixedMedia: false,
    note: "Up to 500 characters, the default on most servers.",
  },
  pinterest: {
    name: "Pinterest",
    text: 500,
    maxMedia: 1,
    requiresMedia: "image",
    imageTypes: ["image/jpeg", "image/png", "image/webp"],
    videoTypes: [],
    maxImageBytes: 20 * MB,
    mixedMedia: false,
    note: "Needs one photo. The caption becomes the Pin description.",
  },
  tiktok: {
    name: "TikTok",
    text: 2200,
    maxMedia: 1,
    requiresMedia: "video",
    imageTypes: [],
    videoTypes: MP4_MOV,
    mixedMedia: false,
    note: "Needs one video. Until TikTok audits the app, posts are private.",
  },
  telegram: {
    name: "Telegram",
    text: 4096,
    captionWithMedia: 1024,
    maxMedia: 10,
    imageTypes: COMMON_IMAGES,
    videoTypes: ["video/mp4"],
    maxImageBytes: 10 * MB,
    mixedMedia: true,
    gifAlone: true,
    note: "Posted to your channel. Captions on media are limited to 1024 characters.",
  },
};

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

export function textLimit(platform: Platform, hasMedia: boolean) {
  const rules = PLATFORM_RULES[platform];
  return hasMedia && rules.captionWithMedia ? rules.captionWithMedia : rules.text;
}

const LABELS: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/webp": "WebP",
  "video/mp4": "MP4",
  "video/quicktime": "MOV",
};

const list = (types: readonly string[]) => {
  const labels = types.map((type) => LABELS[type] ?? type);
  return labels.length > 1
    ? `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`
    : (labels[0] ?? "");
};

export type MediaInfo = { type: string; size?: number };

export function mediaProblem(
  platform: Platform,
  media: readonly MediaInfo[],
): string | undefined {
  const rules = PLATFORM_RULES[platform];
  const name = rules.name;
  if (media.length > rules.maxMedia)
    return `${name} takes up to ${rules.maxMedia} ${rules.maxMedia === 1 ? "file" : "files"}.`;
  const images = media.filter((item) => item.type.startsWith("image/"));
  const videos = media.filter((item) => item.type.startsWith("video/"));
  if (rules.requiresMedia === "any" && media.length === 0)
    return `${name} needs a photo or video.`;
  if (rules.requiresMedia === "image" && images.length === 0)
    return `${name} needs a photo.`;
  if (rules.requiresMedia === "video" && videos.length === 0)
    return `${name} needs a video.`;
  if (images.some((item) => !rules.imageTypes.includes(item.type)))
    return rules.imageTypes.length
      ? `${name} takes ${list(rules.imageTypes)} photos.`
      : `${name} doesn't take photos.`;
  if (videos.some((item) => !rules.videoTypes.includes(item.type)))
    return rules.videoTypes.length
      ? `${name} takes ${list(rules.videoTypes)} videos.`
      : `${name} doesn't take videos.`;
  if (
    rules.maxImageBytes &&
    images.some((item) => (item.size ?? 0) > rules.maxImageBytes!)
  )
    return rules.maxImageBytes < 1024 * 1024
      ? `${name} photos must be under ${Math.round(rules.maxImageBytes / 1024)} KB.`
      : `${name} photos must be under ${Math.round(rules.maxImageBytes / 1024 / 1024)} MB.`;
  if (
    rules.gifAlone &&
    media.length > 1 &&
    media.some((item) => item.type === "image/gif")
  )
    return `${name} takes a single GIF on its own.`;
  if (!rules.mixedMedia && videos.length > 0 && media.length > 1)
    return `${name} takes a video on its own.`;
  return undefined;
}

export function contentProblem(
  platform: Platform,
  text: string,
  media: readonly MediaInfo[],
): string | undefined {
  const name = PLATFORM_RULES[platform].name;
  if (!text.trim() && media.length === 0)
    return `Add text or media for ${name}.`;
  if ([...text].length > textLimit(platform, media.length > 0))
    return `Your ${name} caption is too long.`;
  return mediaProblem(platform, media);
}

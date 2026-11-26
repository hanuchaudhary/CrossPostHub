export { type AuthOptions, type ConnectOptions, Provider, type ProviderConfig } from "./lib/provider";
export { Instagram, type InstagramConfig, type SignedRequest } from "./providers/instagram";
export { LinkedIn, type LinkedInConfig, littleText } from "./providers/linkedin";
export { X, type XConfig } from "./providers/x";
export { LimitError, PostError, ReauthError, ValidationError, type ErrorDetails } from "./lib/errors";
export type {
  Account,
  Limits,
  PostInput,
  PostStatus,
  Privacy,
  ProviderId,
  Tokens,
  VideoSource,
} from "./lib/types";

export * from "./publish";
export { Threads, ThreadsProvider, type ThreadsConfig } from "./providers/threads";
export { Facebook, FacebookProvider, type FacebookConfig } from "./providers/facebook";
export { Bluesky, BlueskyProvider, type BlueskyConfig } from "./providers/bluesky";
export {
  Mastodon,
  MastodonProvider,
  mastodonInstance,
  registerMastodonApp,
  type MastodonConfig,
} from "./providers/mastodon";
export { Pinterest, PinterestProvider, type PinterestConfig } from "./providers/pinterest";
export { TikTok, TikTokProvider, type TikTokConfig } from "./providers/tiktok";
export { Telegram, TelegramProvider, telegramChat, type TelegramConfig } from "./providers/telegram";

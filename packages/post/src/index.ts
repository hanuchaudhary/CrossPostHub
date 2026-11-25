export { type AuthOptions, type ConnectOptions, Provider, type ProviderConfig } from "./lib/provider";
export { YouTube, type YouTubeConfig } from "./providers/youtube";
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

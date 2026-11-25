export type ProviderId = "youtube" | "instagram" | "linkedin" | "x";

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  /** The platform's id of the account these tokens act as, for APIs that address it by id (Instagram). */
  accountId?: string;
};

/** A connected account: who it is, and the tokens to act as it. */
export type Account = {
  id: string;
  name: string;
  avatarUrl?: string;
  /** The platform's id for whoever logged in, when it is not the account id. Meta's deauthorize and data-deletion callbacks send this id. */
  userId?: string;
  tokens: Tokens;
};

/** A provider either downloads the video itself (`url`) or is sent its bytes (`stream`). */
export type VideoSource =
  | { url: string }
  | { stream: ReadableStream<Uint8Array>; size: number };

export type Privacy = "public" | "unlisted" | "private";

export type PostInput = {
  video: VideoSource;
  cover?: { url: string };
  title?: string;
  caption: string;
  privacy?: Privacy;
  madeForKids?: boolean;
};

/** `processing`: call `status(ref)` again after `retryInMs`. */
export type PostStatus =
  | { state: "processing"; ref: string; retryInMs: number }
  | { state: "published"; id: string; url: string };

export type Limits = {
  /** Set when the provider requires a title: its maximum length. */
  title?: number;
  caption: number;
  hashtags?: number;
};

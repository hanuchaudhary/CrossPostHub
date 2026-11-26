import type { Platform } from "@repo/shared/platforms";

export type PostJob = {
  provider: Platform;
  postText: string;
  mediaKeys: string[];
  userId: string;
  postId: string;
  scheduledFor?: string;
};

export type Bindings = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  API_URL: string;
  CLIENT_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  TWITTER_CLIENT_ID?: string;
  TWITTER_CLIENT_SECRET?: string;
  INSTAGRAM_APP_ID?: string;
  INSTAGRAM_APP_SECRET?: string;
  INSTAGRAM_CONFIG_ID?: string;
  SOCIAL_TOKEN_KEY?: string;
  THREADS_APP_ID?: string;
  THREADS_APP_SECRET?: string;
  FACEBOOK_APP_ID?: string;
  FACEBOOK_APP_SECRET?: string;
  PINTEREST_APP_ID?: string;
  PINTEREST_APP_SECRET?: string;
  PINTEREST_API_URL?: string;
  TIKTOK_CLIENT_KEY?: string;
  TIKTOK_CLIENT_SECRET?: string;
  TIKTOK_AUDITED?: string;
  TELEGRAM_BOT_TOKEN?: string;
  DODO_PAYMENTS_API_KEY: string;
  DODO_PAYMENTS_WEBHOOK_KEY: string;
  DODO_PAYMENTS_ENVIRONMENT: "test_mode" | "live_mode";
  DODO_PRODUCT_PRO?: string;
  DODO_PRODUCT_PREMIUM?: string;
  GEMINI_API_KEY?: string;
  FAL_KEY?: string;
  R2_PUBLIC_URL?: string;
  CROSSPOSTHUB_QUEUE: Queue<PostJob>;
  MEDIA_BUCKET: R2Bucket;
};

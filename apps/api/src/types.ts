export type PostJob = {
  provider: "twitter" | "linkedin" | "instagram";
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

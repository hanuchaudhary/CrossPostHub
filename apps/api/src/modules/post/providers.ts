import {
  Bluesky,
  Facebook,
  Instagram,
  LinkedIn,
  Mastodon,
  Pinterest,
  Telegram,
  Threads,
  TikTok,
  X,
  type Provider,
  type ProviderId,
} from "@repo/post";
import type { Bindings } from "../../types";

export function instagramFor(env: Bindings) {
  return new Instagram({
    appId: env.INSTAGRAM_APP_ID ?? "",
    appSecret: env.INSTAGRAM_APP_SECRET ?? "",
    configId: env.INSTAGRAM_CONFIG_ID ?? "",
  });
}

export const pinterestApi = (env: Bindings) =>
  env.PINTEREST_API_URL?.replace(/\/$/, "") || "https://api.pinterest.com";

export function providersFor(
  env: Bindings,
  meta: Record<string, string> = {},
): Partial<Record<ProviderId, Provider>> {
  const providers: Partial<Record<ProviderId, Provider>> = {
    instagram: instagramFor(env),
    linkedin: new LinkedIn({
      clientId: env.LINKEDIN_CLIENT_ID ?? "",
      clientSecret: env.LINKEDIN_CLIENT_SECRET ?? "",
    }),
    x: new X({
      clientId: env.TWITTER_CLIENT_ID ?? "",
      clientSecret: env.TWITTER_CLIENT_SECRET ?? "",
    }),
    threads: new Threads({
      appId: env.THREADS_APP_ID ?? "",
      appSecret: env.THREADS_APP_SECRET ?? "",
    }),
    facebook: new Facebook({
      appId: env.FACEBOOK_APP_ID ?? "",
      appSecret: env.FACEBOOK_APP_SECRET ?? "",
    }),
    bluesky: new Bluesky({}),
    pinterest: new Pinterest({
      appId: env.PINTEREST_APP_ID ?? "",
      appSecret: env.PINTEREST_APP_SECRET ?? "",
      api: pinterestApi(env),
    }),
    tiktok: new TikTok({
      clientKey: env.TIKTOK_CLIENT_KEY ?? "",
      clientSecret: env.TIKTOK_CLIENT_SECRET ?? "",
    }),
    telegram: new Telegram({ botToken: env.TELEGRAM_BOT_TOKEN ?? "" }),
  };
  if (meta.instance && meta.clientId && meta.clientSecret)
    providers.mastodon = new Mastodon({
      instance: meta.instance,
      clientId: meta.clientId,
      clientSecret: meta.clientSecret,
    });
  return providers;
}

const CONFIGURED: Record<ProviderId, (env: Bindings) => boolean> = {
  x: (env) => Boolean(env.TWITTER_CLIENT_ID && env.TWITTER_CLIENT_SECRET),
  linkedin: (env) => Boolean(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET),
  instagram: (env) => Boolean(env.INSTAGRAM_APP_ID && env.INSTAGRAM_APP_SECRET),
  threads: (env) => Boolean(env.THREADS_APP_ID && env.THREADS_APP_SECRET),
  facebook: (env) => Boolean(env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET),
  bluesky: () => true,
  mastodon: () => true,
  pinterest: (env) => Boolean(env.PINTEREST_APP_ID && env.PINTEREST_APP_SECRET),
  tiktok: (env) => Boolean(env.TIKTOK_CLIENT_KEY && env.TIKTOK_CLIENT_SECRET),
  telegram: (env) => Boolean(env.TELEGRAM_BOT_TOKEN),
};

export const isConfigured = (env: Bindings, id: ProviderId) => CONFIGURED[id](env);

export const redirectUri = (env: Bindings, provider: ProviderId) =>
  `${env.API_URL.replace(/\/$/, "")}/api/post/${provider}/callback`;

export const PROVIDER_IDS = [
  "x",
  "linkedin",
  "instagram",
  "threads",
  "facebook",
  "bluesky",
  "mastodon",
  "pinterest",
  "tiktok",
  "telegram",
] as const satisfies readonly ProviderId[];

export function isProviderId(value: string): value is ProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(value);
}

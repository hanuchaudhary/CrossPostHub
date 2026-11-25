import {
  Instagram,
  LinkedIn,
  X,
  YouTube,
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

export function providersFor(
  env: Bindings,
): Partial<Record<ProviderId, Provider>> {
  return {
    youtube: new YouTube({
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    instagram: instagramFor(env),
    linkedin: new LinkedIn({
      clientId: env.LINKEDIN_CLIENT_ID ?? "",
      clientSecret: env.LINKEDIN_CLIENT_SECRET ?? "",
    }),
    x: new X({
      clientId: env.TWITTER_CLIENT_ID ?? "",
      clientSecret: env.TWITTER_CLIENT_SECRET ?? "",
    }),
  };
}

export const redirectUri = (env: Bindings, provider: ProviderId) =>
  `${env.API_URL.replace(/\/$/, "")}/api/post/${provider}/callback`;

export const PROVIDER_IDS = [
  "youtube",
  "instagram",
  "linkedin",
  "x",
] as const satisfies readonly ProviderId[];

export function isProviderId(value: string): value is ProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(value);
}

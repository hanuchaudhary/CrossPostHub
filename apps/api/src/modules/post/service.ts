import {
  mastodonInstance,
  PostError,
  ReauthError,
  registerMastodonApp,
  Telegram,
  type Account,
  type Provider,
  type ProviderId,
  type Tokens,
} from "@repo/post";
import { randomBytes, randomUUID } from "node:crypto";
import type {
  PrismaClient,
  SocialConnection,
} from "../../../generated/prisma/client";
import type { Bindings } from "../../types";
import { decrypt, encrypt } from "./crypto";
import {
  instagramFor,
  isConfigured,
  providersFor,
  redirectUri,
} from "./providers";

const STATE_TTL_MS = 10 * 60_000;
const TELEGRAM_TTL_MS = 30 * 60_000;

export class HttpError extends Error {
  constructor(
    readonly status: 400 | 403 | 404,
    message: string,
  ) {
    super(message);
  }
}

export type CallbackQuery = { code?: string; state?: string; error?: string };

const PROVIDER_NAMES: Record<ProviderId, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  threads: "Threads",
  facebook: "Facebook",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  telegram: "Telegram",
};

const connectionsPage = (env: Bindings) =>
  `${env.CLIENT_URL.replace(/\/$/, "")}/connections`;

export function sealMeta(meta: Record<string, string> | undefined, env: Bindings) {
  return meta && Object.keys(meta).length
    ? encrypt(JSON.stringify(meta), env.SOCIAL_TOKEN_KEY)
    : null;
}

export function openMeta(value: string | null | undefined, env: Bindings) {
  if (!value) return {};
  try {
    return JSON.parse(decrypt(value, env.SOCIAL_TOKEN_KEY)) as Record<string, string>;
  } catch {
    return {};
  }
}

export function providerFor(
  env: Bindings,
  id: ProviderId,
  meta: Record<string, string> = {},
): Provider {
  const provider = providersFor(env, meta)[id];
  if (!provider || !isConfigured(env, id))
    throw new HttpError(400, `${PROVIDER_NAMES[id]} is not configured yet`);
  return provider;
}

export function tokensOf(connection: SocialConnection, env: Bindings): Tokens {
  return {
    accessToken: decrypt(connection.accessToken, env.SOCIAL_TOKEN_KEY),
    refreshToken: connection.refreshToken
      ? decrypt(connection.refreshToken, env.SOCIAL_TOKEN_KEY)
      : undefined,
    expiresAt: connection.expiresAt,
    accountId: connection.externalId,
    meta: openMeta(connection.meta, env),
  };
}

export function sealTokens(tokens: Tokens, env: Bindings) {
  return {
    accessToken: encrypt(tokens.accessToken, env.SOCIAL_TOKEN_KEY),
    refreshToken: tokens.refreshToken
      ? encrypt(tokens.refreshToken, env.SOCIAL_TOKEN_KEY)
      : null,
    expiresAt: tokens.expiresAt,
  };
}

async function canConnectSeveral(db: PrismaClient, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, planId: true },
  });
  return user?.role === "ADMIN" || user?.planId === "premium";
}

async function saveAccount(
  db: PrismaClient,
  env: Bindings,
  userId: string,
  id: ProviderId,
  provider: Provider,
  account: Account,
) {
  const others = await db.socialConnection.count({
    where: { userId, provider: id, externalId: { not: account.id } },
  });
  if (others > 0 && !(await canConnectSeveral(db, userId))) {
    await provider.revoke(account.tokens).catch(() => {});
    throw new HttpError(
      403,
      `Connecting more than one ${PROVIDER_NAMES[id]} account needs the Premium plan`,
    );
  }
  const data = {
    name: account.name,
    avatarUrl: account.avatarUrl ?? null,
    platformUserId: account.userId ?? null,
    meta: sealMeta(account.meta, env),
    status: "ACTIVE" as const,
    ...sealTokens(account.tokens, env),
  };
  return db.socialConnection.upsert({
    where: {
      userId_provider_externalId: { userId, provider: id, externalId: account.id },
    },
    create: { userId, provider: id, externalId: account.id, ...data },
    update: data,
    select: { id: true, provider: true, name: true, avatarUrl: true, status: true },
  });
}

export abstract class PostService {
  static connections(db: PrismaClient, userId: string) {
    return db.socialConnection.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        provider: true,
        name: true,
        avatarUrl: true,
        status: true,
      },
    });
  }

  static async access(db: PrismaClient, userId: string) {
    return { allowed: true, several: await canConnectSeveral(db, userId) };
  }

  static async connectUrl(
    db: PrismaClient,
    env: Bindings,
    userId: string,
    id: ProviderId,
    input: Record<string, string> = {},
  ) {
    let meta: Record<string, string> = {};
    if (id === "mastodon") {
      let instance: string;
      try {
        instance = mastodonInstance(input.instance ?? "");
      } catch (error) {
        throw new HttpError(400, (error as Error).message);
      }
      const app = await registerMastodonApp(
        instance,
        redirectUri(env, id),
        env.CLIENT_URL,
      ).catch(() => {
        throw new HttpError(400, "That Mastodon server did not answer. Check the address");
      });
      meta = { instance, ...app };
    }
    const provider = providerFor(env, id, meta);
    if (provider.connection !== "oauth")
      throw new HttpError(400, `${PROVIDER_NAMES[id]} connects with a form`);
    const state = randomUUID();
    const codeVerifier = randomBytes(48).toString("base64url");
    await db.socialConnectState.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    await db.socialConnectState.create({
      data: {
        state,
        userId,
        provider: id,
        codeVerifier,
        meta: sealMeta(meta, env),
        expiresAt: new Date(Date.now() + STATE_TTL_MS),
      },
    });
    return {
      url: provider.authUrl({
        state,
        redirectUri: redirectUri(env, id),
        codeVerifier,
      }),
    };
  }

  static async connectForm(
    db: PrismaClient,
    env: Bindings,
    userId: string,
    id: ProviderId,
    input: Record<string, string>,
  ) {
    const provider = providerFor(env, id);
    if (provider.connection !== "form")
      throw new HttpError(400, `${PROVIDER_NAMES[id]} connects through its sign-in page`);
    try {
      const account = await provider.connectForm(input);
      return await saveAccount(db, env, userId, id, provider, account);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (error instanceof PostError) throw new HttpError(400, error.message);
      throw error;
    }
  }

  static async telegramStart(
    db: PrismaClient,
    env: Bindings,
    userId: string,
    chat: string,
  ) {
    const provider = providerFor(env, "telegram") as Telegram;
    let found;
    try {
      found = await provider.chat(chat);
    } catch (error) {
      throw new HttpError(400, (error as Error).message);
    }
    const code = `cph-${randomBytes(4).toString("hex")}`;
    const state = randomUUID();
    await db.socialConnectState.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { userId, provider: "telegram" },
        ],
      },
    });
    await db.socialConnectState.create({
      data: {
        state,
        userId,
        provider: "telegram",
        codeVerifier: code,
        meta: sealMeta({ chat: String(found.id) }, env),
        expiresAt: new Date(Date.now() + TELEGRAM_TTL_MS),
      },
    });
    return {
      state,
      code,
      chat: found.title ?? (found.username ? `@${found.username}` : String(found.id)),
    };
  }

  static async telegramVerify(
    db: PrismaClient,
    env: Bindings,
    userId: string,
    state: string,
  ) {
    const saved = await db.socialConnectState.findUnique({ where: { state } });
    if (
      !saved ||
      saved.userId !== userId ||
      saved.provider !== "telegram" ||
      saved.expiresAt < new Date()
    )
      throw new HttpError(400, "This code expired. Start again.");
    const { chat } = openMeta(saved.meta, env);
    const account = await PostService.connectForm(db, env, userId, "telegram", {
      chat: chat ?? "",
      code: saved.codeVerifier,
    });
    await db.socialConnectState.delete({ where: { state } }).catch(() => {});
    return account;
  }

  static async callback(
    db: PrismaClient,
    env: Bindings,
    id: ProviderId,
    query: CallbackQuery,
    sessionUserId: string | null,
  ): Promise<string> {
    const back = (params: Record<string, string>) =>
      `${connectionsPage(env)}?${new URLSearchParams(params)}`;
    if (query.error || !query.code || !query.state) {
      return back({
        error:
          query.error === "access_denied" ||
          query.error?.startsWith("user_cancelled")
            ? "Access was not granted"
            : "Connection failed",
      });
    }

    const state = await db.socialConnectState
      .delete({ where: { state: query.state } })
      .catch(() => null);
    if (!state || state.provider !== id || state.expiresAt < new Date()) {
      return back({ error: "This link expired. Try connecting again." });
    }
    if (sessionUserId && state.userId !== sessionUserId) {
      return back({
        error: "Sign in with the account that started the connection.",
      });
    }

    try {
      const provider = providerFor(env, id, openMeta(state.meta, env));
      const account = await provider.connect({
        code: query.code,
        redirectUri: redirectUri(env, id),
        codeVerifier: state.codeVerifier,
      });
      await saveAccount(db, env, state.userId, id, provider, account);
      return back({ connected: id });
    } catch (error) {
      console.error(`[social-connect-failed] provider=${id}`, error);
      return back({
        error:
          error instanceof PostError || error instanceof HttpError
            ? error.message
            : "Connection failed",
      });
    }
  }

  static async disconnect(
    db: PrismaClient,
    env: Bindings,
    userId: string,
    id: string,
  ) {
    const connection = await db.socialConnection.findFirst({
      where: { id, userId },
    });
    if (!connection) throw new HttpError(404, "Connection not found");

    await Promise.resolve()
      .then(() => {
        const tokens = tokensOf(connection, env);
        return providersFor(env, tokens.meta)[connection.provider]?.revoke(tokens);
      })
      .catch(() => {});
    await db.socialConnection.delete({ where: { id } });
    return { ok: true };
  }

  static async activeTokens(
    db: PrismaClient,
    env: Bindings,
    connection: SocialConnection,
  ) {
    const tokens = tokensOf(connection, env);
    const provider = providerFor(env, connection.provider, tokens.meta);
    if (!provider.needsRefresh(tokens)) return tokens;
    try {
      const fresh = await provider.refresh(tokens);
      await db.socialConnection.update({
        where: { id: connection.id },
        data: {
          ...sealTokens(fresh, env),
          ...(fresh.meta ? { meta: sealMeta(fresh.meta, env) } : {}),
          status: "ACTIVE",
        },
      });
      return { ...fresh, meta: fresh.meta ?? tokens.meta };
    } catch (error) {
      if (error instanceof ReauthError)
        await db.socialConnection.update({
          where: { id: connection.id },
          data: { status: "NEEDS_REAUTH" },
        });
      throw error;
    }
  }

  static async instagramDeauthorize(
    db: PrismaClient,
    env: Bindings,
    signedRequest: string,
  ) {
    const { user_id } = PostService.verify(env, signedRequest);
    await db.socialConnection.updateMany({
      where: PostService.metaUser(user_id),
      data: { status: "NEEDS_REAUTH" },
    });
    return { ok: true };
  }

  static async instagramDataDeletion(
    db: PrismaClient,
    env: Bindings,
    signedRequest: string,
  ) {
    const { user_id } = PostService.verify(env, signedRequest);
    await db.socialConnection.deleteMany({
      where: PostService.metaUser(user_id),
    });
    const confirmation = randomUUID();
    console.log(
      `[social-data-deleted] provider=instagram confirmation=${confirmation}`,
    );
    return { url: connectionsPage(env), confirmation_code: confirmation };
  }

  private static metaUser(userId: string | number) {
    const id = String(userId);
    return {
      provider: { in: ["instagram", "facebook", "threads"] as ProviderId[] },
      OR: [{ platformUserId: id }, { externalId: id }],
    };
  }

  private static verify(env: Bindings, signedRequest: string) {
    try {
      return instagramFor(env).parseSignedRequest(signedRequest);
    } catch {
      throw new HttpError(400, "Invalid signed request");
    }
  }
}

import {
  PostError,
  ReauthError,
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
import { instagramFor, providersFor, redirectUri } from "./providers";

const STATE_TTL_MS = 10 * 60_000;

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
  youtube: "YouTube",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
};

const connectionsPage = (env: Bindings) =>
  `${env.CLIENT_URL.replace(/\/$/, "")}/connections`;

export function providerFor(env: Bindings, id: ProviderId): Provider {
  const provider = providersFor(env)[id];
  if (!provider) throw new HttpError(400, `Posting to ${id} is not available yet`);
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
  ) {
    const provider = providerFor(env, id);
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
      const provider = providerFor(env, id);
      const account = await provider.connect({
        code: query.code,
        redirectUri: redirectUri(env, id),
        codeVerifier: state.codeVerifier,
      });
      const others = await db.socialConnection.count({
        where: {
          userId: state.userId,
          provider: id,
          externalId: { not: account.id },
        },
      });
      if (others > 0 && !(await canConnectSeveral(db, state.userId))) {
        await provider.revoke(account.tokens).catch(() => {});
        return back({
          error: `Connecting more than one ${PROVIDER_NAMES[id]} account needs the Premium plan`,
        });
      }
      const data = {
        name: account.name,
        avatarUrl: account.avatarUrl ?? null,
        platformUserId: account.userId ?? null,
        status: "ACTIVE" as const,
        ...sealTokens(account.tokens, env),
      };
      await db.socialConnection.upsert({
        where: {
          userId_provider_externalId: {
            userId: state.userId,
            provider: id,
            externalId: account.id,
          },
        },
        create: {
          userId: state.userId,
          provider: id,
          externalId: account.id,
          ...data,
        },
        update: data,
      });
      return back({ connected: id });
    } catch (error) {
      console.error(`[social-connect-failed] provider=${id}`, error);
      return back({
        error: error instanceof PostError ? error.message : "Connection failed",
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
      .then(() =>
        providersFor(env)[connection.provider]?.revoke(
          tokensOf(connection, env),
        ),
      )
      .catch(() => {});
    await db.socialConnection.delete({ where: { id } });
    return { ok: true };
  }

  static async activeTokens(
    db: PrismaClient,
    env: Bindings,
    connection: SocialConnection,
  ) {
    const provider = providerFor(env, connection.provider);
    const tokens = tokensOf(connection, env);
    if (!provider.needsRefresh(tokens)) return tokens;
    try {
      const fresh = await provider.refresh(tokens);
      await db.socialConnection.update({
        where: { id: connection.id },
        data: { ...sealTokens(fresh, env), status: "ACTIVE" },
      });
      return fresh;
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
      provider: "instagram" as const,
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

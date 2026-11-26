import {
  PublishError,
  ReauthError,
  type ProviderId,
  type PublishAccount,
} from "@repo/post";
import type { Platform } from "@repo/shared/platforms";
import type { PrismaClient } from "../../generated/prisma/client";
import { PostService } from "../modules/post/service";
import type { Bindings, PostJob } from "../types";

export const providerOf = (platform: Platform): ProviderId =>
  platform === "twitter" ? "x" : platform;

export async function getPublishingAccount(
  db: PrismaClient,
  env: Bindings,
  job: PostJob,
): Promise<PublishAccount> {
  const connection = await db.socialConnection.findFirst({
    where: { userId: job.userId, provider: providerOf(job.provider) },
    orderBy: { createdAt: "asc" },
  });
  if (!connection)
    throw new PublishError(`${job.provider} account is not connected`);
  if (connection.status === "NEEDS_REAUTH")
    throw new PublishError(
      `${job.provider} access expired; reconnect the account`,
    );
  try {
    const tokens = await PostService.activeTokens(db, env, connection);
    return {
      accountId: connection.externalId,
      accessToken:
        job.provider === "telegram"
          ? (env.TELEGRAM_BOT_TOKEN ?? "")
          : tokens.accessToken,
      refreshToken: tokens.refreshToken,
      meta: tokens.meta,
    };
  } catch (error) {
    if (error instanceof ReauthError)
      throw new PublishError(
        `${job.provider} access expired; reconnect the account`,
      );
    throw new PublishError(
      `${job.provider} credentials could not be resolved; reconnect the account if this continues`,
      true,
    );
  }
}

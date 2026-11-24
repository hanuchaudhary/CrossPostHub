import { decryptOAuthToken } from "better-auth/oauth2";
import type { PrismaClient } from "../../generated/prisma/client";
import type { PublishAccount } from "../core";
import { PublishError } from "../core";
import type { Bindings, PostJob } from "../types";
import { createAuth } from "./auth";

export async function getPublishingAccount(
  db: PrismaClient,
  env: Bindings,
  job: PostJob,
): Promise<PublishAccount> {
  const account = await db.account.findFirst({
    where: { userId: job.userId, providerId: job.provider },
  });
  if (!account?.accessToken)
    throw new PublishError(`${job.provider} account is not connected`);
  const auth = createAuth(env, db);
  if (job.provider === "instagram") {
    if (
      account.accessTokenExpiresAt &&
      account.accessTokenExpiresAt.getTime() <= Date.now()
    )
      throw new PublishError("Instagram token expired; reconnect the account");
    const accessToken = await decryptOAuthToken(
      account.accessToken,
      (await auth.$context) as unknown as Parameters<
        typeof decryptOAuthToken
      >[1],
    );
    if (!accessToken)
      throw new PublishError(
        "Instagram token is missing; reconnect the account",
      );
    return { accountId: account.accountId, accessToken };
  }
  try {
    const token = await auth.api.getAccessToken({
      body: { userId: job.userId, accountId: account.id },
    });
    if (
      !token.accessToken ||
      (token.accessTokenExpiresAt &&
        token.accessTokenExpiresAt.getTime() <= Date.now() + 5_000)
    )
      throw new PublishError(
        `${job.provider} token expired; reconnect the account`,
      );
    const required =
      job.provider === "linkedin"
        ? ["w_member_social"]
        : ["tweet.write", ...(job.mediaKeys.length ? ["media.write"] : [])];
    const missing = required.filter((scope) => !token.scopes.includes(scope));
    if (missing.length)
      throw new PublishError(
        `${job.provider} is missing ${missing.join(", ")}; reconnect the account to grant publishing permissions`,
      );
    return { accountId: account.accountId, accessToken: token.accessToken };
  } catch (error) {
    if (error instanceof PublishError) throw error;
    throw new PublishError(
      `${job.provider} credentials could not be resolved; reconnect the account if this continues`,
      true,
    );
  }
}

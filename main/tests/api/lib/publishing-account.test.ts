import { expect, spyOn, test } from "bun:test";
import { symmetricEncrypt, symmetricDecrypt } from "better-auth/crypto";
import { getPublishingAccount } from "../../../apps/api/src/lib/publishing-account";
import * as authModule from "../../../apps/api/src/lib/auth";
import { asPrisma, bindings, database, isolate } from "../support";
import type { PostJob } from "../../../apps/api/src/types";
isolate();

async function fixture() {
  const db = database();
  const { env } = bindings();
  env.TWITTER_CLIENT_ID = "test-client-id";
  env.TWITTER_CLIENT_SECRET = "test-client-secret";
  env.LINKEDIN_CLIENT_ID = "linkedin-id";
  env.LINKEDIN_CLIENT_SECRET = "linkedin-secret";
  const auth = authModule.createAuth(env, asPrisma(db));
  spyOn(authModule, "createAuth").mockReturnValue(auth);
  const context = await auth.$context;
  const account = {
    id: "local-account-id", userId: "user-1", providerId: "twitter", accountId: "x-person",
    accessToken: await symmetricEncrypt({ key: context.secretConfig, data: "plain-access-token" }),
    accessTokenExpiresAt: new Date(Date.now() + 60_000),
    refreshToken: null as string | null,
    scope: "tweet.read,tweet.write,users.read,offline.access,media.write",
    createdAt: new Date(), updatedAt: new Date(),
  };
  db.account.findFirst.mockResolvedValue(account);
  db.account.findMany.mockImplementation(async () => [account]);
  const job: PostJob = { provider: "twitter", userId: "user-1", postId: "post-1", postText: "Hello", mediaKeys: [] };
  return { db, env, auth, context, account, job, resolve: () => getPublishingAccount(asPrisma(db), env, job) };
}

test("publishing resolves and decrypts the owned account using its local row ID", async () => {
  const h = await fixture();
  expect(h.account.accessToken).not.toBe("plain-access-token");
  expect(await h.resolve()).toEqual({ accountId: "x-person", accessToken: "plain-access-token" });
  expect(h.db.account.findFirst).toHaveBeenCalledWith({ where: { userId: "user-1", providerId: "twitter" } });
});

test("publishing refreshes expired encrypted credentials and persists encrypted rotated tokens", async () => {
  // Exercise Better Auth's actual server-side token API with a stubbed provider exchange.
  const h = await fixture();
  h.account.accessTokenExpiresAt = new Date(Date.now() - 60_000);
  h.account.refreshToken = await symmetricEncrypt({ key: h.context.secretConfig, data: "plain-refresh-token" });
  const provider = h.context.socialProviders.find((provider) => provider.id === "twitter")!;
  const refresh = spyOn(provider, "refreshAccessToken").mockImplementation(async (token) => {
    expect(token).toBe("plain-refresh-token");
    return { accessToken: "fresh-token", refreshToken: "rotated-token", accessTokenExpiresAt: new Date(Date.now() + 3_600_000) };
  });
  const update = spyOn(h.context.internalAdapter, "updateAccount").mockImplementation(async (_id, data) => ({ ...h.account, ...data }));
  expect(await h.resolve()).toEqual({ accountId: "x-person", accessToken: "fresh-token" });
  expect(refresh).toHaveBeenCalledTimes(1);
  const stored = update.mock.calls[0]![1];
  expect(stored.accessToken).not.toBe("fresh-token");
  expect(await symmetricDecrypt({ key: h.context.secretConfig, data: stored.refreshToken! })).toBe("rotated-token");
});

test("publishing reports a reconnect when expired credentials have no refresh token", async () => {
  const h = await fixture();
  h.account.accessTokenExpiresAt = new Date(Date.now() - 60_000);
  await expect(h.resolve()).rejects.toThrow("expired; reconnect");
});

test("publishing requires media.write only for X media posts", async () => {
  const h = await fixture();
  h.account.scope = "tweet.read,tweet.write,users.read,offline.access";
  expect((await h.resolve()).accessToken).toBe("plain-access-token");
  h.job.mediaKeys = ["media/user-1/photo.jpg"];
  await expect(h.resolve()).rejects.toThrow("media.write");
});

test("LinkedIn publishing requires w_member_social, not just OIDC login scopes", async () => {
  const h = await fixture();
  h.account.providerId = "linkedin";
  h.job.provider = "linkedin";
  h.account.scope = "openid,profile,email";
  await expect(h.resolve()).rejects.toThrow("w_member_social");
  h.account.scope += ",w_member_social";
  expect((await h.resolve()).accessToken).toBe("plain-access-token");
});

test("publishing does not resolve another user's account row", async () => {
  const h = await fixture();
  h.db.account.findFirst.mockResolvedValue(null);
  await expect(h.resolve()).rejects.toThrow("not connected");
  expect(h.db.account.findMany).not.toHaveBeenCalled();
});

test("Instagram's existing token is decrypted without requiring an unsupported auth provider", async () => {
  const h = await fixture();
  h.job.provider = "instagram";
  h.account.providerId = "instagram";
  expect((await h.resolve()).accessToken).toBe("plain-access-token");
  h.account.accessTokenExpiresAt = new Date(Date.now() - 60_000);
  await expect(h.resolve()).rejects.toThrow("Instagram token expired");
});

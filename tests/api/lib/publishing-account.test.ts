import { expect, spyOn, test } from "bun:test";
import { getPublishingAccount } from "../../../apps/api/src/lib/publishing-account";
import { LimitError, ReauthError, X } from "../../../packages/post/src";
import { decrypt, encrypt } from "../../../apps/api/src/modules/post/crypto";
import type { PostJob } from "../../../apps/api/src/types";
import { asPrisma, bindings, database, isolate } from "../support";
isolate();

async function fixture() {
  const db = database();
  const { env } = bindings();
  env.TWITTER_CLIENT_ID = "test-client-id";
  env.TWITTER_CLIENT_SECRET = "test-client-secret";
  const connection = {
    id: "connection-1",
    userId: "user-1",
    provider: "x" as const,
    externalId: "x-person",
    name: "@person",
    avatarUrl: null,
    accessToken: encrypt("plain-access-token", env.SOCIAL_TOKEN_KEY),
    refreshToken: null as string | null,
    expiresAt: new Date(Date.now() + 60 * 60_000),
    status: "ACTIVE" as "ACTIVE" | "NEEDS_REAUTH",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.socialConnection.findFirst.mockImplementation(async () => connection);
  db.socialConnection.update.mockImplementation(async (input) => ({
    ...connection,
    ...input.data,
  }));
  const job: PostJob = {
    provider: "twitter",
    userId: "user-1",
    postId: "post-1",
    postText: "Hello",
    mediaKeys: [],
  };
  return {
    db,
    env,
    connection,
    job,
    resolve: () => getPublishingAccount(asPrisma(db), env, job),
  };
}

test("publishing resolves and decrypts the owner's social connection", async () => {
  const h = await fixture();
  expect(h.connection.accessToken).not.toContain("plain-access-token");
  expect(await h.resolve()).toMatchObject({
    accountId: "x-person",
    accessToken: "plain-access-token",
  });
  expect(h.db.socialConnection.findFirst).toHaveBeenCalledWith({
    where: { userId: "user-1", provider: "x" },
    orderBy: { createdAt: "asc" },
  });
});

test("publishing refreshes expiring tokens and stores the rotated ones encrypted", async () => {
  const h = await fixture();
  h.connection.expiresAt = new Date(Date.now() - 60_000);
  h.connection.refreshToken = encrypt(
    "plain-refresh-token",
    h.env.SOCIAL_TOKEN_KEY,
  );
  const refresh = spyOn(X.prototype, "refresh").mockImplementation(
    async (tokens) => {
      expect(tokens.refreshToken).toBe("plain-refresh-token");
      return {
        accessToken: "fresh-token",
        refreshToken: "rotated-token",
        expiresAt: new Date(Date.now() + 3_600_000),
      };
    },
  );
  expect(await h.resolve()).toMatchObject({
    accountId: "x-person",
    accessToken: "fresh-token",
    refreshToken: "rotated-token",
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  const stored = h.db.socialConnection.update.mock.calls[0]![0].data;
  expect(stored.accessToken).not.toBe("fresh-token");
  expect(decrypt(stored.refreshToken, h.env.SOCIAL_TOKEN_KEY)).toBe(
    "rotated-token",
  );
});

test("publishing marks the connection for reconnect when refresh is refused", async () => {
  const h = await fixture();
  h.connection.expiresAt = new Date(Date.now() - 60_000);
  spyOn(X.prototype, "refresh").mockRejectedValue(
    new ReauthError("No refresh token; connect again"),
  );
  await expect(h.resolve()).rejects.toThrow("expired; reconnect");
  expect(h.db.socialConnection.update).toHaveBeenCalledWith({
    where: { id: "connection-1" },
    data: { status: "NEEDS_REAUTH" },
  });
});

test("publishing stops early for a connection that already needs reconnecting", async () => {
  const h = await fixture();
  h.connection.status = "NEEDS_REAUTH";
  await expect(h.resolve()).rejects.toThrow("reconnect the account");
});

test("transient refresh failures stay retryable", async () => {
  const h = await fixture();
  h.connection.expiresAt = new Date(Date.now() - 60_000);
  h.connection.refreshToken = encrypt("refresh", h.env.SOCIAL_TOKEN_KEY);
  spyOn(X.prototype, "refresh").mockRejectedValue(
    new LimitError("Too many requests"),
  );
  await expect(h.resolve()).rejects.toMatchObject({ retryable: true });
});

test("publishing does not resolve another user's connection", async () => {
  const h = await fixture();
  h.db.socialConnection.findFirst.mockResolvedValue(null);
  await expect(h.resolve()).rejects.toThrow("not connected");
});

import { expect, spyOn, test } from "bun:test";
import { createHmac } from "node:crypto";
import { post } from "../../../apps/api/src/modules/post";
import { decrypt } from "../../../apps/api/src/modules/post/crypto";
import { X } from "../../../packages/post/src";
import { harness, isolate } from "../support";
isolate();

function setup(authenticated = true) {
  const h = harness(post, "/post", authenticated);
  h.env.TWITTER_CLIENT_ID = "x-client";
  h.env.TWITTER_CLIENT_SECRET = "x-secret";
  h.env.INSTAGRAM_APP_SECRET = "meta-secret";
  return h;
}

const savedState = (userId = "user-1") => ({
  state: "s1",
  userId,
  provider: "x",
  codeVerifier: "verifier",
  expiresAt: new Date(Date.now() + 60_000),
});

test("connection routes require a session", async () => {
  const h = setup(false);
  expect((await h.request("/post/connections")).status).toBe(401);
  expect(
    (await h.request("/post/x/connect", { method: "POST" })).status,
  ).toBe(401);
});

test("connections lists only the current user's rows", async () => {
  const h = setup();
  h.db.socialConnection.findMany.mockResolvedValue([{ id: "c1" }]);
  expect(await (await h.request("/post/connections")).json()).toEqual([
    { id: "c1" },
  ]);
  expect(h.db.socialConnection.findMany.mock.calls[0]![0].where).toEqual({
    userId: "user-1",
  });
});

test("connect stores a state and returns an X PKCE authorize URL", async () => {
  const h = setup();
  h.db.socialConnectState.deleteMany.mockResolvedValue({ count: 0 });
  h.db.socialConnectState.create.mockResolvedValue({});
  const response = await h.request("/post/x/connect", { method: "POST" });
  const url = new URL(((await response.json()) as { url: string }).url);
  const saved = h.db.socialConnectState.create.mock.calls[0]![0].data;
  expect(url.origin).toBe("https://x.com");
  expect(url.searchParams.get("client_id")).toBe("x-client");
  expect(url.searchParams.get("state")).toBe(saved.state);
  expect(url.searchParams.get("redirect_uri")).toBe(
    "https://api.example.com/api/post/x/callback",
  );
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("code_challenge")).not.toBe(saved.codeVerifier);
  expect(url.toString()).not.toContain("x-secret");
  expect(saved.userId).toBe("user-1");
});

test("connect rejects unknown providers", async () => {
  const h = setup();
  expect(
    (await h.request("/post/threads/connect", { method: "POST" })).status,
  ).toBe(400);
});

test("callback saves encrypted tokens and returns to the connections page", async () => {
  const h = setup();
  h.db.socialConnectState.delete.mockResolvedValue(savedState());
  h.db.socialConnection.count.mockResolvedValue(0);
  h.db.socialConnection.upsert.mockResolvedValue({});
  spyOn(X.prototype, "connect").mockResolvedValue({
    id: "x-person",
    name: "@person",
    tokens: {
      accessToken: "access",
      refreshToken: "refresh",
      expiresAt: new Date(Date.now() + 7_200_000),
    },
  });
  const response = await h.request("/post/x/callback?code=abc&state=s1");
  expect(response.status).toBe(302);
  expect(response.headers.get("location")).toBe(
    "https://app.example.com/connections?connected=x",
  );
  const saved = h.db.socialConnection.upsert.mock.calls[0]![0];
  expect(saved.where.userId_provider_externalId).toEqual({
    userId: "user-1",
    provider: "x",
    externalId: "x-person",
  });
  expect(decrypt(saved.create.accessToken, h.env.SOCIAL_TOKEN_KEY)).toBe(
    "access",
  );
});

test("a second account on one platform needs the Premium plan", async () => {
  const h = setup();
  h.db.socialConnectState.delete.mockResolvedValue(savedState());
  h.db.socialConnection.count.mockResolvedValue(1);
  h.db.user.findUnique.mockResolvedValue({ role: "USER", planId: "pro" });
  spyOn(X.prototype, "connect").mockResolvedValue({
    id: "x-other",
    name: "@other",
    tokens: { accessToken: "a", expiresAt: new Date() },
  });
  const revoke = spyOn(X.prototype, "revoke").mockResolvedValue();
  const response = await h.request("/post/x/callback?code=abc&state=s1");
  const location = new URL(response.headers.get("location")!);
  expect(location.searchParams.get("error")).toContain("Premium");
  expect(revoke).toHaveBeenCalled();
  expect(h.db.socialConnection.upsert).not.toHaveBeenCalled();
});

test("callback refuses a state started by another user", async () => {
  const h = setup();
  h.db.socialConnectState.delete.mockResolvedValue(savedState("someone-else"));
  const response = await h.request("/post/x/callback?code=abc&state=s1");
  const location = new URL(response.headers.get("location")!);
  expect(location.searchParams.get("error")).toContain("Sign in");
  expect(h.db.socialConnection.upsert).not.toHaveBeenCalled();
});

test("callback reports a cancelled consent", async () => {
  const h = setup();
  const response = await h.request("/post/x/callback?error=access_denied");
  const location = new URL(response.headers.get("location")!);
  expect(location.searchParams.get("error")).toBe("Access was not granted");
});

test("disconnect removes only an owned connection", async () => {
  const h = setup();
  h.db.socialConnection.findFirst.mockResolvedValueOnce(null);
  expect(
    (await h.request("/post/connections/c1", { method: "DELETE" })).status,
  ).toBe(404);
  expect(h.db.socialConnection.findFirst.mock.calls[0]![0].where).toEqual({
    id: "c1",
    userId: "user-1",
  });
});

test("Meta deauthorize marks the Instagram connection for reconnect", async () => {
  const h = setup(false);
  const payload = Buffer.from(
    JSON.stringify({
      user_id: "meta-user",
      algorithm: "HMAC-SHA256",
      issued_at: Math.floor(Date.now() / 1000),
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", "meta-secret")
    .update(payload)
    .digest("base64url");
  h.db.socialConnection.updateMany.mockResolvedValue({ count: 1 });
  const response = await h.request("/post/instagram/deauthorize", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ signed_request: `${signature}.${payload}` }),
  });
  expect(response.status).toBe(200);
  expect(h.db.socialConnection.updateMany.mock.calls[0]![0]).toEqual({
    where: {
      provider: "instagram",
      OR: [{ platformUserId: "meta-user" }, { externalId: "meta-user" }],
    },
    data: { status: "NEEDS_REAUTH" },
  });
});

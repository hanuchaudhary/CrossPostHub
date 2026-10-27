import { expect, spyOn, test } from "bun:test";
import { linkOAuthAccount } from "better-auth/oauth2";
import { createAuth } from "../../../apps/api/src/lib/auth";
import { asPrisma, bindings, database, isolate } from "../support";
isolate();

test("auth config enables encrypted tokens, verified linking, rate limits and trusted client", () => {
  const { env } = bindings();
  const auth = createAuth(env, asPrisma(database()));
  expect(auth.options.trustedOrigins).toEqual([env.CLIENT_URL]);
  expect(auth.options.account?.encryptOAuthTokens).toBe(true);
  expect(auth.options.account?.accountLinking?.requireLocalEmailVerified).toBe(
    true,
  );
  expect(auth.options.rateLimit).toMatchObject({
    enabled: true,
    window: 10,
    max: 100,
  });
  expect(auth.options.emailAndPassword?.enabled).toBe(true);
});

test("auth config supplies provider credentials and current publishing scopes", () => {
  const { env } = bindings();
  env.GOOGLE_CLIENT_ID = "google-id";
  env.GOOGLE_CLIENT_SECRET = "google-secret";
  env.TWITTER_CLIENT_ID = "twitter-id";
  env.TWITTER_CLIENT_SECRET = "twitter-secret";
  env.LINKEDIN_CLIENT_ID = "incomplete";
  const auth = createAuth(env, asPrisma(database()));
  expect(auth.options.socialProviders?.google).toMatchObject({ clientId: "google-id" });
  expect(auth.options.socialProviders?.linkedin).toMatchObject({ scope: ["openid", "profile", "email", "w_member_social"] });
  expect(auth.options.socialProviders?.twitter).toMatchObject({
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access", "media.write"],
  });
});

async function linkingFixture() {
  const { env } = bindings();
  const auth = createAuth(env, asPrisma(database()));
  const context = await auth.$context;
  const endpoint = { context } as unknown as Parameters<typeof linkOAuthAccount>[0];
  const findAccount = spyOn(context.internalAdapter, "findAccountByKey").mockResolvedValue(null);
  const createAccount = spyOn(context.internalAdapter, "createAccount").mockImplementation(async (input) => ({
    ...input, id: "linked-account", createdAt: new Date(), updatedAt: new Date(),
  }));
  const input: Parameters<typeof linkOAuthAccount>[1] = {
    link: { userId: "user-1", email: "personal@example.com" },
    userInfo: { name: "Test User", email: "work@example.com", emailVerified: true },
    account: { accountId: "linkedin-person", providerId: "linkedin", accessToken: "test-access-token" },
    profile: { sub: "linkedin-person", email: "work@example.com", email_verified: true },
    scopes: ["openid", "profile", "email"],
  };
  return { env, auth, context, endpoint, input, findAccount, createAccount };
}

test("explicit LinkedIn linking accepts a verified work email different from the app login", async () => {
  const h = await linkingFixture();
  const result = await linkOAuthAccount(h.endpoint, h.input);
  expect(result).toEqual({ linked: true });
  expect(h.createAccount).toHaveBeenCalledWith(expect.objectContaining({
    userId: "user-1", accountId: "linkedin-person", providerId: "linkedin",
  }));
  expect(h.createAccount.mock.calls[0]![0].accessToken).not.toBe("test-access-token");
  expect(h.context.options.account?.accountLinking?.requireLocalEmailVerified).toBe(true);
});

test("the previous same-email policy reproduces the original linking error", async () => {
  const h = await linkingFixture();
  Reflect.set(h.context.options.account!.accountLinking!, "allowDifferentEmails", false);
  expect(await linkOAuthAccount(h.endpoint, h.input)).toMatchObject({ linked: false, error: { code: "email_does_not_match" } });
  expect(h.createAccount).not.toHaveBeenCalled();
});

test("different-email linking still rejects unverified provider emails", async () => {
  const h = await linkingFixture();
  h.input.userInfo.emailVerified = false;
  expect(await linkOAuthAccount(h.endpoint, h.input)).toMatchObject({ linked: false, error: { code: "unable_to_link_account" } });
  expect(h.createAccount).not.toHaveBeenCalled();
});

test("different-email linking cannot take an account owned by another user", async () => {
  const h = await linkingFixture();
  h.findAccount.mockResolvedValue({ ...h.input.account, id: "existing", userId: "other-user", createdAt: new Date(), updatedAt: new Date() });
  expect(await linkOAuthAccount(h.endpoint, h.input)).toMatchObject({ linked: false, error: { code: "account_already_linked_to_different_user" } });
  expect(h.createAccount).not.toHaveBeenCalled();
});

test("the actual link-social endpoint requires an authenticated app session", async () => {
  const { env } = bindings();
  env.LINKEDIN_CLIENT_ID = "test-id";
  env.LINKEDIN_CLIENT_SECRET = "test-secret";
  const auth = createAuth(env, asPrisma(database()));
  const response = await auth.handler(new Request(`${env.API_URL}/api/auth/link-social`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: env.CLIENT_URL },
    body: JSON.stringify({ provider: "linkedin", callbackURL: `${env.CLIENT_URL}/dashboard` }),
  }));
  expect(response.status).toBe(401);
});

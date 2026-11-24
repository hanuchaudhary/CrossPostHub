import { expect, test } from "bun:test";

import {
  connectionCallbackError,
  connectionError,
  connectionRedirect,
} from "../../apps/web/src/lib/connection-flow";

test("OAuth navigation accepts provider HTTPS URLs and local development callbacks", () => {
  for (const url of [
    "https://x.com/i/oauth2/authorize?state=opaque&code_challenge=proof",
    "https://www.linkedin.com/oauth/v2/authorization?state=opaque",
    "http://localhost:8787/api/auth/callback/twitter",
    "http://127.0.0.1:8787/callback",
    "http://[::1]:8787/callback",
  ])
    expect(connectionRedirect(url)).toBe(url);
});

test("missing or unsafe OAuth URLs fail instead of locking the page or redirecting unsafely", () => {
  for (const url of [
    undefined,
    null,
    {},
    "",
    "/connections",
    "not a url",
    "javascript:alert(1)",
    "data:text/html,hello",
    "http://provider.example/authorize",
    "http://localhost.evil.example/callback",
    "httpsx://example.com",
    "//x.com/authorize",
  ])
    expect(() => connectionRedirect(url)).toThrow();
});

test("cancelled OAuth and accounts owned by another user have actionable feedback", () => {
  expect(connectionCallbackError("access_denied")).toContain("cancelled");
  expect(connectionCallbackError("user_rejected")).toContain("cancelled");
  expect(
    connectionCallbackError("account_already_linked_to_different_user")
  ).toContain("different CrossPostHub account");
  expect(connectionCallbackError("unable_to_link_account")).toContain(
    "verification"
  );
});

test("OAuth callback errors do not display raw provider errors or sensitive query content", () => {
  for (const error of [
    null,
    "secret-access-token",
    "<script>alert(1)</script>",
    "Unexpected provider traceback",
    "constructor",
    "__proto__",
    "toString",
  ])
    expect(connectionCallbackError(error)).toBe(
      "Couldn’t connect your account. Please try again."
    );
});

test("last-account rejection, stale sessions and already-disconnected accounts have actionable messages", () => {
  expect(
    connectionError({ code: "FAILED_TO_UNLINK_LAST_ACCOUNT" }).message
  ).toContain("only sign-in method");
  expect(connectionError({ code: "SESSION_IS_NOT_FRESH" }).message).toContain(
    "sign in again"
  );
  expect(connectionError({ code: "SESSION_EXPIRED" }).message).toContain(
    "sign in again"
  );
  expect(connectionError({ code: "ACCOUNT_NOT_FOUND" }).message).toContain(
    "already disconnected"
  );
});

test("unconfigured channels and unverified emails produce specific errors", () => {
  expect(connectionError({ code: "PROVIDER_NOT_FOUND" }).message).toContain(
    "isn’t configured"
  );
  expect(connectionError({ code: "EMAIL_NOT_VERIFIED" }).message).toContain(
    "Verify your email"
  );
  expect(connectionError({ message: "Network unavailable" }).message).toBe(
    "Network unavailable"
  );
  expect(connectionError({}).message).toContain("Please try again");
});

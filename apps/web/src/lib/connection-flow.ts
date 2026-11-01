const messages = new Map<string, string>(
  Object.entries({
    PROVIDER_NOT_FOUND:
      "This channel isn’t configured yet. Please try another channel.",
    FAILED_TO_UNLINK_LAST_ACCOUNT:
      "This is your only sign-in method. Add another sign-in method before disconnecting it.",
    SESSION_IS_NOT_FRESH:
      "Please sign in again before managing your connections.",
    SESSION_EXPIRED: "Your session expired. Please sign in again.",
    UNAUTHORIZED: "Please sign in again to manage your connections.",
    EMAIL_NOT_VERIFIED: "Verify your email before connecting a channel.",
    ACCOUNT_NOT_FOUND:
      "This account is already disconnected. Your connections will be refreshed.",
    ACCOUNT_ALREADY_LINKED:
      "This account is already linked. Your connections will be refreshed.",
    SOCIAL_ACCOUNT_ALREADY_LINKED:
      "This account is already linked. Your connections will be refreshed.",
    access_denied:
      "Connection cancelled. Your existing connections haven’t changed.",
    user_rejected:
      "Connection cancelled. Your existing connections haven’t changed.",
    account_already_linked_to_different_user:
      "This social account is linked to a different CrossPostHub account.",
    email_does_not_match:
      "This provider’s email couldn’t be linked to your account.",
    unable_to_link_account:
      "The provider couldn’t verify this account. Check its email verification and try again.",
  })
);

export function connectionError(error: { code?: string; message?: string }) {
  return new Error(
    messages.get(error.code ?? "") ||
      error.message ||
      "Couldn’t update your connection. Please try again."
  );
}

export function connectionCallbackError(code: string | null) {
  return (
    messages.get(code ?? "") ||
    messages.get(code?.toUpperCase() ?? "") ||
    "Couldn’t connect your account. Please try again."
  );
}

export function connectionRedirect(value: unknown) {
  if (typeof value !== "string" || !value)
    throw new Error(
      "The provider didn’t return a connection URL. Please try again."
    );
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "The provider returned an invalid connection URL. Please try again."
    );
  }
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
  )
    throw new Error(
      "The provider returned an invalid connection URL. Please try again."
    );
  return url.href;
}

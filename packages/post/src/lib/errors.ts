import type { ProviderId } from "./types";

export type ErrorDetails = {
  provider?: ProviderId;
  /** HTTP status of the provider's response, when there was one. */
  status?: number;
  /** The provider's own error code. */
  code?: string | number;
  cause?: unknown;
};

/** Anything a provider refused or failed. Safe to retry unless a subclass says otherwise. */
export class PostError extends Error {
  override name = "PostError";
  readonly provider?: ProviderId;
  readonly status?: number;
  readonly code?: string | number;

  constructor(message: string, details: ErrorDetails = {}) {
    super(message, { cause: details.cause });
    this.provider = details.provider;
    this.status = details.status;
    this.code = details.code;
  }
}

/** The account must be connected again: its access was revoked or expired for good. */
export class ReauthError extends PostError {
  override name = "ReauthError";
}

/** A provider cap was reached. Retrying before `retryAfterMs` fails the same way. */
export class LimitError extends PostError {
  override name = "LimitError";
  readonly retryAfterMs?: number;

  constructor(message: string, details: ErrorDetails & { retryAfterMs?: number } = {}) {
    super(message, details);
    this.retryAfterMs = details.retryAfterMs;
  }
}

/** The input can never succeed as it is: fix it before trying again. */
export class ValidationError extends PostError {
  override name = "ValidationError";
}

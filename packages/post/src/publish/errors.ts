export class PublishError extends Error {
  constructor(
    message: string,
    readonly retryable = false,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "PublishError";
  }
}

export function providerHttpError(
  provider: string,
  operation: string,
  status: number,
  headers: Headers,
): PublishError {
  const retryAfter = headers.get("retry-after");
  const reset = headers.get("x-rate-limit-reset");
  let seconds: number | undefined;
  if (retryAfter)
    seconds = /^\d+$/.test(retryAfter)
      ? Number(retryAfter)
      : Math.ceil((Date.parse(retryAfter) - Date.now()) / 1000);
  else if (status === 429 && reset)
    seconds = Math.ceil(Number(reset) - Date.now() / 1000);
  if (!Number.isFinite(seconds) || (seconds ?? 0) < 0) seconds = undefined;
  return new PublishError(
    `${provider} ${operation} failed (${status})${status === 401 || status === 403 ? "; reconnect the account and check its publishing permissions" : ""}`,
    [408, 409, 422, 429].includes(status) || status >= 500,
    seconds,
  );
}

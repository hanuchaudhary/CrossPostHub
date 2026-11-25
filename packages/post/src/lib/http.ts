import { PostError } from "./errors";

export type HttpFailure = { status: number; body: unknown; headers: Headers };
export type ErrorMapper = (failure: HttpFailure) => PostError;

type Query = Record<string, string | number | boolean | undefined>;

export type RequestOptions = RequestInit & {
  query?: Query;
  /** Sent as a JSON body. */
  json?: unknown;
  /** Sent as an `application/x-www-form-urlencoded` body; undefined values are left out. */
  form?: Record<string, string | undefined>;
  /** Attempts after the first, on a network error or a 5xx. Defaults to 2 for GET and 0 otherwise, so a POST is never sent twice. */
  retries?: number;
  /** Non-2xx statuses that are an answer, not a failure (YouTube's 308 between upload chunks). */
  accept?: number[];
};

/** One fetch wrapper for every provider: bodies, query strings, retries, and errors mapped by the provider. */
export class Http {
  constructor(
    private readonly mapError: ErrorMapper,
    private readonly fetcher: typeof fetch = fetch,
    private readonly retryDelayMs = 500
  ) {}

  async request(url: string, options: RequestOptions = {}): Promise<Response> {
    const { query, json, form, retries, accept, ...init } = options;
    const method = (init.method ?? "GET").toUpperCase();
    const attempts = 1 + (retries ?? (method === "GET" ? 2 : 0));
    const headers = new Headers(init.headers);
    let body = init.body;
    if (json !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(json);
    } else if (form) {
      body = new URLSearchParams(defined(form));
    }

    for (let attempt = 1; ; attempt++) {
      const retry = attempt < attempts;
      let response: Response;
      try {
        response = await this.fetcher(withQuery(url, query), { ...init, method, headers, body });
      } catch (cause) {
        if (retry) {
          await this.backoff(attempt);
          continue;
        }
        throw new PostError(`Could not reach ${new URL(url).host}`, { cause });
      }
      if (response.ok || accept?.includes(response.status)) return response;
      if (response.status >= 500 && retry) {
        await this.backoff(attempt);
        continue;
      }
      throw this.mapError({
        status: response.status,
        body: await readBody(response),
        headers: response.headers,
      });
    }
  }

  async json<T>(url: string, options?: RequestOptions): Promise<T> {
    return (await readBody(await this.request(url, options))) as T;
  }

  private backoff(attempt: number) {
    const ms = this.retryDelayMs * 2 ** (attempt - 1);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** The human-readable message in a provider's error body, whatever its shape. */
export function errorMessage(body: unknown): string | undefined {
  if (typeof body === "string") return body || undefined;
  if (!body || typeof body !== "object") return undefined;
  const value = body as Record<string, unknown>;
  const error = value.error;
  if (error && typeof error === "object") {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string") return message;
  }
  for (const key of ["error_description", "message", "error_message", "error"]) {
    if (typeof value[key] === "string") return value[key];
  }
  return undefined;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function withQuery(url: string, query?: Query) {
  if (!query) return url;
  const target = new URL(url);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) target.searchParams.set(key, String(value));
  }
  return target.toString();
}

function defined(values: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => entry[1] !== undefined)
  );
}

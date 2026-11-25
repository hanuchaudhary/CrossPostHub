import { LimitError, PostError, ReauthError } from "../lib/errors";
import type { HttpFailure } from "../lib/http";
import { Provider, type ProviderConfig } from "../lib/provider";
import { chunks } from "../lib/stream";
import type { Account, PostInput, PostStatus, Tokens } from "../lib/types";

export type YouTubeConfig = ProviderConfig & {
  clientId: string;
  clientSecret: string;
  /** Bytes per upload request. A multiple of 256 KiB, as Google requires. */
  chunkSize?: number;
  /** YouTube category for new videos. 22 is People & Blogs. */
  categoryId?: string;
  /** Wait before asking a dropped upload where it stands. Defaults to 1 s, growing per attempt. */
  resumeDelayMs?: number;
};

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const API = "https://www.googleapis.com/youtube/v3";
const UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos";
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
];
const CHUNK = 32 * 256 * 1024; // 8 MiB
const RESUME_ATTEMPTS = 4;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};
type Channel = {
  id: string;
  snippet: { title: string; thumbnails?: Record<string, { url: string }> };
};

/** YouTube Data API v3. A vertical video of 3 minutes or less is published as a Short. */
export class YouTube extends Provider<YouTubeConfig> {
  readonly id = "youtube" as const;
  readonly limits = { title: 100, caption: 5000 };
  readonly accepts = "stream" as const;

  authUrl({ state, redirectUri }: { state: string; redirectUri: string }) {
    const url = new URL(AUTH_URL);
    url.search = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      // Google returns a refresh token only on consent, so always ask.
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    }).toString();
    return url.toString();
  }

  async connect({
    code,
    redirectUri,
  }: {
    code: string;
    redirectUri: string;
  }): Promise<Account> {
    const tokens = this.tokens(
      await this.http.json<TokenResponse>(TOKEN_URL, {
        method: "POST",
        form: {
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
      })
    );
    if (!tokens.refreshToken) {
      throw new ReauthError(
        "Google did not grant offline access; connect again",
        {
          provider: this.id,
        }
      );
    }
    const { items } = await this.http.json<{ items?: Channel[] }>(
      `${API}/channels`,
      {
        query: { part: "snippet", mine: true },
        headers: this.auth(tokens),
      }
    );
    const channel = items?.[0];
    if (!channel) {
      throw new PostError("This Google account has no YouTube channel", {
        provider: this.id,
      });
    }
    const thumbnails = channel.snippet.thumbnails ?? {};
    return {
      id: channel.id,
      name: channel.snippet.title,
      avatarUrl: (thumbnails.medium ?? thumbnails.default)?.url,
      tokens,
    };
  }

  async refresh(tokens: Tokens): Promise<Tokens> {
    if (!tokens.refreshToken) {
      throw new ReauthError("No refresh token; connect again", {
        provider: this.id,
      });
    }
    const response = await this.http.json<TokenResponse>(TOKEN_URL, {
      method: "POST",
      form: {
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      },
    });
    return this.tokens(response, tokens);
  }

  async revoke(tokens: Tokens): Promise<void> {
    await this.http.request(REVOKE_URL, {
      method: "POST",
      form: { token: tokens.refreshToken ?? tokens.accessToken },
    });
  }

  async publish(tokens: Tokens, input: PostInput): Promise<PostStatus> {
    this.validate(input);
    if (!("stream" in input.video))
      throw this.invalid("The video must be given as a stream");
    const { stream, size } = input.video;

    const session = await this.http.request(UPLOAD_URL, {
      method: "POST",
      query: { uploadType: "resumable", part: "snippet,status" },
      headers: {
        ...this.auth(tokens),
        "x-upload-content-type": "video/*",
        "x-upload-content-length": String(size),
      },
      json: {
        snippet: {
          title: input.title!.trim(),
          description: input.caption,
          categoryId: this.config.categoryId ?? "22",
        },
        status: {
          privacyStatus: input.privacy ?? "public",
          selfDeclaredMadeForKids: input.madeForKids ?? false,
        },
      },
    });
    const location = session.headers.get("location");
    if (!location)
      throw new PostError("YouTube did not open an upload session", {
        provider: this.id,
      });

    const video = await this.upload(location, stream, size, tokens);
    return {
      state: "published",
      id: video.id,
      url: `https://youtube.com/shorts/${video.id}`,
    };
  }

  /** The upload finishes in `publish`; YouTube keeps processing on its side, which needs no follow-up. */
  async status(_tokens: Tokens, ref: string): Promise<PostStatus> {
    return {
      state: "published",
      id: ref,
      url: `https://youtube.com/shorts/${ref}`,
    };
  }

  /** Sends the stream in chunks. Each chunk but the last answers 308 (Resume Incomplete). */
  private async upload(
    location: string,
    stream: ReadableStream<Uint8Array>,
    size: number,
    tokens: Tokens
  ): Promise<{ id: string }> {
    const chunkSize = this.config.chunkSize ?? CHUNK;
    let offset = 0;
    for await (const chunk of chunks(stream, chunkSize)) {
      const response = await this.sendChunk(
        location,
        chunk,
        offset,
        size,
        tokens
      );
      offset += chunk.byteLength;
      if (response.status !== 308)
        return (await response.json()) as { id: string };
    }
    throw new PostError(`The video ended at ${offset} of ${size} bytes`, {
      provider: this.id,
    });
  }

  /**
   * Sends one chunk. When the connection drops or Google answers 5xx, it asks
   * the session how many bytes arrived and resends only the rest, so a long
   * upload survives a hiccup without starting over.
   */
  private async sendChunk(
    location: string,
    chunk: Uint8Array,
    offset: number,
    size: number,
    tokens: Tokens
  ): Promise<Response> {
    let sent = 0;
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.http.request(location, {
          method: "PUT",
          headers: {
            ...this.auth(tokens),
            "content-range": `bytes ${offset + sent}-${offset + chunk.byteLength - 1}/${size}`,
          },
          body: chunk.subarray(sent) as BodyInit,
          // 308 is not "ok" to fetch, but it is how Google says "send the next chunk".
          redirect: "manual",
          accept: [308],
        });
      } catch (error) {
        const transient =
          error instanceof PostError &&
          (error.status === undefined || error.status >= 500);
        if (!transient || attempt >= RESUME_ATTEMPTS) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.resumeDelayMs ?? 1000 * attempt)
        );
        const progress = await this.progress(location, size, tokens);
        if (progress.status !== 308) return progress;
        sent = Math.max(0, received(progress) - offset);
        if (sent >= chunk.byteLength) return progress;
      }
    }
  }

  /** Asks an upload session where it stands: 308 with the bytes received so far, or 200/201 when done. */
  private progress(location: string, size: number, tokens: Tokens) {
    return this.http.request(location, {
      method: "PUT",
      headers: { ...this.auth(tokens), "content-range": `bytes */${size}` },
      redirect: "manual",
      accept: [308],
      retries: 2,
    });
  }

  protected override mapError(failure: HttpFailure) {
    const reason = googleReason(failure.body);
    const details = { provider: this.id, status: failure.status, code: reason };
    if (reason === "invalid_grant") {
      return new ReauthError(
        "YouTube access was revoked or expired; connect again",
        details
      );
    }
    if (
      reason === "quotaExceeded" ||
      reason === "uploadLimitExceeded" ||
      reason === "rateLimitExceeded"
    ) {
      return new LimitError(super.mapError(failure).message, details);
    }
    return super.mapError(failure);
  }

  private auth(tokens: Tokens) {
    return { authorization: `Bearer ${tokens.accessToken}` };
  }
}

/** Google puts its reason in `error.errors[0].reason` (API) or `error` (OAuth). */
function googleReason(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const error = (body as { error?: unknown }).error;
  if (typeof error === "string") return error;
  const reason = (error as { errors?: { reason?: string }[] } | undefined)
    ?.errors?.[0]?.reason;
  return reason;
}

/** Bytes an upload session holds, from its `Range: bytes=0-N` header (absent when none). */
function received(response: Response) {
  const end = response.headers.get("range")?.match(/bytes=0-(\d+)/)?.[1];
  return end === undefined ? 0 : Number(end) + 1;
}

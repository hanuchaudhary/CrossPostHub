import { createHash } from "node:crypto";

import { PostError, ReauthError, ValidationError } from "../lib/errors";
import { errorMessage, type HttpFailure } from "../lib/http";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import { chunks } from "../lib/stream";
import type { Account, PostInput, PostStatus, Tokens } from "../lib/types";

export type XConfig = ProviderConfig & {
  clientId: string;
  clientSecret: string;
  /** Bytes per append request. X takes up to 8 MB; 4 MiB keeps well clear of it. */
  chunkSize?: number;
};

const AUTH_URL = "https://x.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.x.com/2/oauth2/token";
const REVOKE_URL = "https://api.x.com/2/oauth2/revoke";
const API = "https://api.x.com/2";
const SCOPES = ["tweet.read", "tweet.write", "users.read", "media.write", "offline.access"];
const CHUNK = 4 * 1024 * 1024;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};
type User = { id: string; name: string; username: string; profile_image_url?: string };
type ProcessingInfo = {
  state: "pending" | "in_progress" | "succeeded" | "failed";
  check_after_secs?: number;
};
type Media = { id: string; processing_info?: ProcessingInfo };
/** What `status` needs to create the post once the video is processed; kept as the job's `ref`. */
type Pending = { mediaId: string; text: string };

/**
 * X API v2, posting as the signed-in user (OAuth 2.0 with PKCE). The video goes up through the
 * chunked media endpoints; X may process it before it can be attached, in which case `publish`
 * returns `processing` and `status` creates the post when the media is ready.
 */
export class X extends Provider<XConfig> {
  readonly id = "x" as const;
  /** 280 unless the account has X Premium; the API rejects longer text for everyone else. */
  readonly limits = { caption: 280 };
  readonly accepts = "stream" as const;

  authUrl({ state, redirectUri, codeVerifier }: AuthOptions) {
    if (!codeVerifier) throw this.invalid("X needs a PKCE code verifier");
    const url = new URL(AUTH_URL);
    url.search = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: SCOPES.join(" "),
      state,
      code_challenge: createHash("sha256").update(codeVerifier).digest("base64url"),
      code_challenge_method: "S256",
    }).toString();
    return url.toString();
  }

  async connect({ code, redirectUri, codeVerifier }: ConnectOptions): Promise<Account> {
    if (!codeVerifier) throw this.invalid("X needs a PKCE code verifier");
    const tokens = this.tokens(
      await this.http.json<TokenResponse>(TOKEN_URL, {
        method: "POST",
        headers: this.basic(),
        form: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
          client_id: this.config.clientId,
        },
      })
    );
    if (!tokens.refreshToken) {
      throw new ReauthError("X did not grant offline access; connect again", { provider: this.id });
    }
    const { data: user } = await this.http.json<{ data: User }>(`${API}/users/me`, {
      query: { "user.fields": "profile_image_url" },
      headers: this.bearer(tokens),
    });
    return {
      id: user.id,
      name: `@${user.username}`,
      avatarUrl: user.profile_image_url,
      tokens: { ...tokens, accountId: user.id },
    };
  }

  /** Access tokens last two hours. X rotates the refresh token, so the new one must be saved. */
  async refresh(tokens: Tokens): Promise<Tokens> {
    if (!tokens.refreshToken) {
      throw new ReauthError("No refresh token; connect again", { provider: this.id });
    }
    const response = await this.http.json<TokenResponse>(TOKEN_URL, {
      method: "POST",
      headers: this.basic(),
      form: {
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
        client_id: this.config.clientId,
      },
    });
    return { ...this.tokens(response, tokens), accountId: tokens.accountId };
  }

  async revoke(tokens: Tokens): Promise<void> {
    await this.http.request(REVOKE_URL, {
      method: "POST",
      headers: this.basic(),
      form: {
        token: tokens.refreshToken ?? tokens.accessToken,
        token_type_hint: tokens.refreshToken ? "refresh_token" : "access_token",
      },
    });
  }

  override async publish(tokens: Tokens, input: PostInput): Promise<PostStatus> {
    this.validate(input);
    if (!("stream" in input.video)) throw this.invalid("The video must be given as a stream");
    const { stream, size } = input.video;

    const { data: init } = await this.http.json<{ data: Media }>(`${API}/media/upload/initialize`, {
      method: "POST",
      headers: this.bearer(tokens),
      json: { media_type: "video/mp4", total_bytes: size, media_category: "tweet_video" },
    });

    let segment = 0;
    for await (const chunk of chunks(stream, this.config.chunkSize ?? CHUNK)) {
      const form = new FormData();
      form.set("segment_index", String(segment++));
      form.set("media", new Blob([chunk], { type: "application/octet-stream" }));
      await this.http.request(`${API}/media/upload/${init.id}/append`, {
        method: "POST",
        headers: this.bearer(tokens),
        body: form,
        // Re-sending a segment index replaces it, so a retry is safe.
        retries: 2,
      });
    }

    const { data: media } = await this.http.json<{ data: Media }>(
      `${API}/media/upload/${init.id}/finalize`,
      { method: "POST", headers: this.bearer(tokens) }
    );
    return this.next(tokens, { mediaId: init.id, text: input.caption }, media.processing_info);
  }

  override async status(tokens: Tokens, ref: string): Promise<PostStatus> {
    const pending = JSON.parse(ref) as Pending;
    const { data: media } = await this.http.json<{ data: Media }>(`${API}/media/upload`, {
      query: { command: "STATUS", media_id: pending.mediaId },
      headers: this.bearer(tokens),
    });
    return this.next(tokens, pending, media.processing_info);
  }

  /** Posts once the media is ready (no `processing_info` means ready), or waits as X asks. */
  private async next(
    tokens: Tokens,
    pending: Pending,
    info: ProcessingInfo | undefined
  ): Promise<PostStatus> {
    if (info?.state === "failed") {
      throw new ValidationError("X could not process the video", { provider: this.id });
    }
    if (info && info.state !== "succeeded") {
      return {
        state: "processing",
        ref: JSON.stringify(pending),
        retryInMs: Math.max(1, info.check_after_secs ?? 5) * 1000,
      };
    }
    const { data } = await this.http.json<{ data: { id: string } }>(`${API}/tweets`, {
      method: "POST",
      headers: this.bearer(tokens),
      json: {
        ...(pending.text.trim() ? { text: pending.text } : {}),
        media: { media_ids: [pending.mediaId] },
      },
    });
    if (!data?.id) throw new PostError("X did not return the post id", { provider: this.id });
    return { state: "published", id: data.id, url: `https://x.com/i/web/status/${data.id}` };
  }

  protected override mapError(failure: HttpFailure) {
    const message = xMessage(failure.body);
    const details = { provider: this.id, status: failure.status };
    if (failure.status === 400 && errorCode(failure.body) === "invalid_grant") {
      return new ReauthError("X access was revoked or expired; connect again", details);
    }
    // 403: duplicate text, a video over the account's length cap, or an app without write access.
    // None of these change on retry.
    if (failure.status === 403) {
      return new ValidationError(message ?? "X refused this post", details);
    }
    const error = super.mapError(failure);
    if (message) error.message = message;
    return error;
  }

  private basic() {
    const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    return { authorization: `Basic ${credentials}` };
  }

  private bearer(tokens: Tokens) {
    return { authorization: `Bearer ${tokens.accessToken}` };
  }
}

/** X answers with problem+json (`detail`/`title`), an `errors` list, or OAuth's `error_description`. */
function xMessage(body: unknown): string | undefined {
  if (body && typeof body === "object") {
    const value = body as { detail?: unknown; errors?: { message?: unknown }[] };
    if (typeof value.detail === "string") return value.detail;
    const first = value.errors?.[0]?.message;
    if (typeof first === "string") return first;
  }
  return errorMessage(body);
}

function errorCode(body: unknown) {
  return body && typeof body === "object" ? (body as { error?: unknown }).error : undefined;
}

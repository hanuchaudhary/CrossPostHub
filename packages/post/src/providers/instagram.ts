import { createHmac, timingSafeEqual } from "node:crypto";

import {
  LimitError,
  PostError,
  ReauthError,
  ValidationError,
} from "../lib/errors";
import type { HttpFailure } from "../lib/http";
import { Provider, type ProviderConfig } from "../lib/provider";
import type { Account, PostInput, PostStatus, Tokens } from "../lib/types";

export type InstagramConfig = ProviderConfig & {
  /** The Meta app id (not a separate Instagram app id). */
  appId: string;
  /** The Meta app secret. */
  appSecret: string;
  /** Login configuration id, from App Dashboard > Instagram > API setup with Unified login. */
  configId: string;
  /** Graph API version. */
  version?: string;
};

const AUTH_URL = "https://www.facebook.com/dialog/oauth";
const GRAPH = "https://graph.facebook.com";
const DAY = 24 * 60 * 60_000;
const POLL_MS = 15_000;
/** A system-user token never expires; this is the expiry stored when Meta sends none. */
const NEVER_MS = 10 * 365 * DAY;

type SharedAccounts = {
  data?: { id: string; username?: string; profile_picture_url?: string }[];
};
type Container = {
  status_code: "IN_PROGRESS" | "FINISHED" | "ERROR" | "EXPIRED" | "PUBLISHED";
  status?: string;
};
type PublishingLimit = {
  data?: { quota_usage: number; config?: { quota_total: number } }[];
};
type GraphError = {
  code?: number;
  error_subcode?: number;
  message?: string;
  error_user_msg?: string;
};

/** Signed requests Meta sends to the deauthorize and data-deletion callbacks. */
const SIGNED_REQUEST_MAX_AGE_SECONDS = 24 * 60 * 60;

export type SignedRequest = {
  user_id: string;
  algorithm: string;
  issued_at: number;
};

/**
 * Instagram API with Unified Login (Facebook Login for Business): Reels on a Business or Creator account.
 * Instagram downloads the video from a URL, then publishing is two steps:
 * a container that processes, and a publish once it is FINISHED.
 */
export class Instagram extends Provider<InstagramConfig> {
  readonly id = "instagram" as const;
  readonly limits = { caption: 2200, hashtags: 30 };
  readonly accepts = "url" as const;

  authUrl({ state, redirectUri }: { state: string; redirectUri: string }) {
    const url = new URL(AUTH_URL);
    url.search = new URLSearchParams({
      client_id: this.config.appId,
      config_id: this.config.configId,
      redirect_uri: redirectUri,
      response_type: "code",
      override_default_response_type: "true",
      display: "popup",
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
    const token = await this.http.json<{
      access_token: string;
      expires_in?: number;
    }>(this.url("oauth", "access_token"), {
      query: {
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        redirect_uri: redirectUri,
        code,
      },
    });
    const shared = await this.http.json<SharedAccounts>(
      this.url("me", "assigned_instagram_accounts"),
      {
        query: {
          fields: "id,username,profile_picture_url",
          access_token: token.access_token,
        },
      }
    );
    const account = shared.data?.[0];
    if (!account) {
      throw this.invalid(
        "No Instagram account was shared. Connect again and select a Business or Creator account"
      );
    }
    // With a system-user token, /me is the business integration system user, not the Instagram account.
    // Its app-scoped id is what the deauthorize and data-deletion callbacks can name.
    const me = await this.http.json<{ id: string }>(this.url("me"), {
      query: { fields: "id", access_token: token.access_token },
    });
    return {
      id: account.id,
      name: account.username ? `@${account.username}` : account.id,
      avatarUrl: account.profile_picture_url,
      userId: me.id,
      tokens: {
        accessToken: token.access_token,
        expiresAt: new Date(
          Date.now() + (token.expires_in ? token.expires_in * 1000 : NEVER_MS)
        ),
        accountId: account.id,
      },
    };
  }

  /** The system-user token does not expire, so there is nothing to refresh: an expired one means the user must connect again. */
  async refresh(): Promise<Tokens> {
    throw new ReauthError("The Instagram connection expired; connect again", {
      provider: this.id,
    });
  }

  /** A system-user token has no revoke call: the user removes the app from their business integrations. */
  async revoke(): Promise<void> {}

  override async publish(tokens: Tokens, input: PostInput): Promise<PostStatus> {
    this.validate(input);
    if (!("url" in input.video))
      throw this.invalid("The video must be given as a url");
    const account = this.account(tokens);

    const limit = await this.http.json<PublishingLimit>(
      this.url(account, "content_publishing_limit"),
      {
        query: {
          fields: "quota_usage,config",
          access_token: tokens.accessToken,
        },
      }
    );
    const usage = limit.data?.[0];
    if (usage?.config && usage.quota_usage >= usage.config.quota_total) {
      throw new LimitError(
        `This account reached Instagram's limit of ${usage.config.quota_total} posts a day`,
        {
          provider: this.id,
          retryAfterMs: DAY,
        }
      );
    }

    const container = await this.http.json<{ id: string }>(
      this.url(account, "media"),
      {
        method: "POST",
        query: { access_token: tokens.accessToken },
        json: {
          media_type: "REELS",
          video_url: input.video.url,
          cover_url: input.cover?.url,
          caption: input.caption,
          share_to_feed: true,
        },
      }
    );
    return { state: "processing", ref: container.id, retryInMs: POLL_MS };
  }

  override async status(tokens: Tokens, ref: string): Promise<PostStatus> {
    const container = await this.http.json<Container>(this.url(ref), {
      query: { fields: "status_code,status", access_token: tokens.accessToken },
    });
    switch (container.status_code) {
      case "IN_PROGRESS":
        return { state: "processing", ref, retryInMs: POLL_MS };
      case "ERROR":
      case "EXPIRED":
        throw new ValidationError(
          container.status ||
            `Instagram could not process the video (${container.status_code})`,
          {
            provider: this.id,
            code: container.status_code,
          }
        );
      case "PUBLISHED":
        throw new PostError("This container was already published", {
          provider: this.id,
        });
    }

    const media = await this.http.json<{ id: string }>(
      this.url(this.account(tokens), "media_publish"),
      {
        method: "POST",
        query: { access_token: tokens.accessToken },
        json: { creation_id: ref },
      }
    );
    const { permalink } = await this.http.json<{ permalink: string }>(
      this.url(media.id),
      {
        query: { fields: "permalink", access_token: tokens.accessToken },
      }
    );
    return { state: "published", id: media.id, url: permalink };
  }

  /** Verifies and decodes the `signed_request` of Meta's deauthorize and data-deletion callbacks. */
  parseSignedRequest(signed: string): SignedRequest {
    if (!this.config.appSecret)
      throw this.invalid("Instagram app secret is not set");
    const [signature, payload] = signed.split(".");
    if (!signature || !payload) throw this.invalid("Malformed signed request");
    const expected = createHmac("sha256", this.config.appSecret)
      .update(payload)
      .digest();
    const actual = Buffer.from(signature, "base64url");
    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      throw this.invalid("Invalid signed request signature");
    }
    const request = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as SignedRequest;
    if (String(request.algorithm).toUpperCase() !== "HMAC-SHA256") {
      throw this.invalid("Unsupported signed request algorithm");
    }
    const age = Date.now() / 1000 - Number(request.issued_at);
    if (
      !Number.isFinite(age) ||
      age > SIGNED_REQUEST_MAX_AGE_SECONDS ||
      age < -300
    ) {
      throw this.invalid("Signed request expired");
    }
    return request;
  }

  /** Graph errors carry a numeric code: 190 is a dead token; 4, 9, 17, 32 and 613 are rate or publishing limits. */
  protected override mapError(failure: HttpFailure) {
    const error = (failure.body as { error?: GraphError } | undefined)?.error;
    const message =
      error?.error_user_msg ||
      error?.message ||
      super.mapError(failure).message;
    const details = {
      provider: this.id,
      status: failure.status,
      code: error?.error_subcode ?? error?.code,
    };
    if (error?.code === 190) return new ReauthError(message, details);
    if (error?.code && [4, 9, 17, 32, 613].includes(error.code))
      return new LimitError(message, details);
    return super.mapError(failure);
  }

  private account(tokens: Tokens) {
    if (!tokens.accountId)
      throw this.invalid("The Instagram account id is missing; connect again");
    return tokens.accountId;
  }

  private url(...path: string[]) {
    return `${GRAPH}/${this.config.version ?? "v27.0"}/${path.join("/")}`;
  }
}

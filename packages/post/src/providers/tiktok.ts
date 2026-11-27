import { ReauthError } from "../lib/errors";
import type { HttpFailure } from "../lib/http";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import type { Account, Tokens } from "../lib/types";
import { PublishError } from "../publish/errors";
import { mediaChunks, openMedia } from "../publish/media";
import { defaultFetch, send, sleep } from "../publish/request";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../publish/types";

export type TikTokConfig = ProviderConfig & {
  clientKey: string;
  clientSecret: string;
};

const API = "https://open.tiktokapis.com/v2";
const SCOPES = ["user.info.basic", "video.publish"];
const MIN_CHUNK = 5 * 1024 * 1024;
const CHUNK = 10 * 1024 * 1024;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  open_id: string;
};

type Envelope<T> = { data?: T; error?: { code?: string; message?: string } };

export class TikTok extends Provider<TikTokConfig> {
  readonly id = "tiktok" as const;
  readonly limits = { caption: 2200 };
  readonly accepts = "stream" as const;

  authUrl({ state, redirectUri }: AuthOptions) {
    const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
    url.search = new URLSearchParams({
      client_key: this.config.clientKey,
      scope: SCOPES.join(","),
      response_type: "code",
      redirect_uri: redirectUri,
      state,
    }).toString();
    return url.toString();
  }

  async connect({ code, redirectUri }: ConnectOptions): Promise<Account> {
    const token = await this.http.json<TokenResponse>(`${API}/oauth/token/`, {
      method: "POST",
      form: {
        client_key: this.config.clientKey,
        client_secret: this.config.clientSecret,
        code: decodeURIComponent(code),
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      },
    });
    const info = await this.http.json<
      Envelope<{ user?: { open_id: string; display_name?: string; avatar_url?: string } }>
    >(`${API}/user/info/`, {
      query: { fields: "open_id,display_name,avatar_url" },
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    const user = info.data?.user;
    return {
      id: token.open_id,
      name: user?.display_name ?? "TikTok account",
      avatarUrl: user?.avatar_url,
      tokens: { ...this.tokens(token), accountId: token.open_id },
    };
  }

  async refresh(tokens: Tokens): Promise<Tokens> {
    if (!tokens.refreshToken)
      throw new ReauthError("TikTok access expired; connect again", { provider: this.id });
    const response = await this.http.json<TokenResponse>(`${API}/oauth/token/`, {
      method: "POST",
      form: {
        client_key: this.config.clientKey,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      },
    });
    return { ...this.tokens(response, tokens), accountId: tokens.accountId };
  }

  async revoke(tokens: Tokens): Promise<void> {
    await this.http.request(`${API}/oauth/revoke/`, {
      method: "POST",
      form: {
        client_key: this.config.clientKey,
        client_secret: this.config.clientSecret,
        token: tokens.accessToken,
      },
    });
  }

  protected override mapError(failure: HttpFailure) {
    const body = failure.body as { error?: string | { code?: string } } | undefined;
    const code = typeof body?.error === "string" ? body.error : body?.error?.code;
    if (code === "invalid_grant" || code === "access_token_invalid")
      return new ReauthError("TikTok access expired; connect again", {
        provider: this.id,
        status: failure.status,
      });
    return super.mapError(failure);
  }
}

export class TikTokProvider implements CrossPostProvider {
  readonly name = "tiktok";

  constructor(
    private readonly fetch: Fetch = defaultFetch,
    private readonly options: { audited?: boolean; wait?: (ms: number) => Promise<void> } = {},
  ) {}

  private call<T>(operation: string, path: string, token: string, body: unknown) {
    return send<Envelope<T>>("TikTok", operation, this.fetch, `${API}${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(body),
    }).then((envelope) => {
      if (envelope.error && envelope.error.code && envelope.error.code !== "ok")
        throw new PublishError(
          `TikTok ${operation} failed: ${envelope.error.message ?? envelope.error.code}`,
          envelope.error.code === "rate_limit_exceeded",
        );
      return envelope.data as T;
    });
  }

  async publish({ account, text, media = [] }: PublishContent): Promise<PublishResult> {
    if (media.length !== 1) throw new PublishError("TikTok needs exactly one video");
    const source = await openMedia(media[0]!);
    if (!source.contentType.startsWith("video/")) {
      await source.stream.cancel().catch(() => {});
      throw new PublishError("TikTok needs a video");
    }
    const token = account.accessToken;
    const creator = await this.call<{ privacy_level_options?: string[] }>(
      "creator check",
      "/post/publish/creator_info/query/",
      token,
      {},
    );
    const options = creator.privacy_level_options ?? [];
    const privacy =
      this.options.audited && options.includes("PUBLIC_TO_EVERYONE")
        ? "PUBLIC_TO_EVERYONE"
        : options.includes("SELF_ONLY")
          ? "SELF_ONLY"
          : (options[0] ?? "SELF_ONLY");
    const size = source.size;
    const chunk = size <= MIN_CHUNK ? size : CHUNK;
    const count = Math.max(1, Math.floor(size / chunk));
    const sizes = Array.from({ length: count }, (_, index) =>
      index === count - 1 ? size - chunk * (count - 1) : chunk,
    );
    const init = await this.call<{ publish_id: string; upload_url: string }>(
      "upload start",
      "/post/publish/video/init/",
      token,
      {
        post_info: { title: text, privacy_level: privacy },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: size,
          chunk_size: chunk,
          total_chunk_count: count,
        },
      },
    );
    let offset = 0;
    for await (const part of mediaChunks(source, sizes)) {
      const end = offset + part.byteLength - 1;
      await send<unknown>("TikTok", "video upload", this.fetch, init.upload_url, {
        method: "PUT",
        headers: {
          "content-type": source.contentType,
          "content-length": String(part.byteLength),
          "content-range": `bytes ${offset}-${end}/${size}`,
        },
        body: part,
      });
      offset = end + 1;
    }
    const wait = this.options.wait ?? sleep;
    for (let attempt = 0; attempt < 30; attempt++) {
      const status = await this.call<{ status?: string; fail_reason?: string }>(
        "status check",
        "/post/publish/status/fetch/",
        token,
        { publish_id: init.publish_id },
      );
      if (status.status === "PUBLISH_COMPLETE" || status.status === "SEND_TO_USER_INBOX")
        return { provider: this.name, response: { publish_id: init.publish_id, privacy } };
      if (status.status === "FAILED")
        throw new PublishError(
          `TikTok could not publish the video${status.fail_reason ? `: ${status.fail_reason}` : ""}`,
        );
      await wait(5_000);
    }
    return { provider: this.name, response: { publish_id: init.publish_id, privacy } };
  }
}

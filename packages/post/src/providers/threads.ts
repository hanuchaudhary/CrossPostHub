import { ReauthError } from "../lib/errors";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import type { Account, Tokens } from "../lib/types";
import { PublishError } from "../publish/errors";
import {
  defaultFetch,
  form,
  publicUrls,
  send,
  sleep,
} from "../publish/request";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../publish/types";

export type ThreadsConfig = ProviderConfig & {
  appId: string;
  appSecret: string;
};

const AUTH_URL = "https://threads.net/oauth/authorize";
const GRAPH = "https://graph.threads.net";
const API = `${GRAPH}/v1.0`;
const SCOPES = ["threads_basic", "threads_content_publish"];
const DAY = 24 * 60 * 60_000;

type Profile = {
  id: string;
  username?: string;
  threads_profile_picture_url?: string;
};

export class Threads extends Provider<ThreadsConfig> {
  readonly id = "threads" as const;
  readonly limits = { caption: 500 };
  readonly accepts = "url" as const;

  authUrl({ state, redirectUri }: AuthOptions) {
    const url = new URL(AUTH_URL);
    url.search = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: redirectUri,
      scope: SCOPES.join(","),
      response_type: "code",
      state,
    }).toString();
    return url.toString();
  }

  async connect({ code, redirectUri }: ConnectOptions): Promise<Account> {
    const short = await this.http.json<{ access_token: string }>(
      `${GRAPH}/oauth/access_token`,
      {
        method: "POST",
        form: {
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code: code.replace(/#_$/, ""),
        },
      },
    );
    const long = await this.http.json<{
      access_token: string;
      expires_in: number;
    }>(`${GRAPH}/access_token`, {
      query: {
        grant_type: "th_exchange_token",
        client_secret: this.config.appSecret,
        access_token: short.access_token,
      },
    });
    const profile = await this.http.json<Profile>(`${API}/me`, {
      query: {
        fields: "id,username,threads_profile_picture_url",
        access_token: long.access_token,
      },
    });
    return {
      id: profile.id,
      name: profile.username ? `@${profile.username}` : profile.id,
      avatarUrl: profile.threads_profile_picture_url,
      tokens: { ...this.tokens(long), accountId: profile.id },
    };
  }

  override needsRefresh(tokens: Tokens, withinMs = 7 * DAY) {
    return super.needsRefresh(tokens, withinMs);
  }

  async refresh(tokens: Tokens): Promise<Tokens> {
    if (tokens.expiresAt.getTime() <= Date.now())
      throw new ReauthError("Threads access expired; connect again", {
        provider: this.id,
      });
    const response = await this.http.json<{
      access_token: string;
      expires_in: number;
    }>(`${GRAPH}/refresh_access_token`, {
      query: {
        grant_type: "th_refresh_token",
        access_token: tokens.accessToken,
      },
    });
    return { ...this.tokens(response, tokens), accountId: tokens.accountId };
  }

  async revoke(): Promise<void> {}
}

type Container = { id?: string; status?: string; error_message?: string };

export class ThreadsProvider implements CrossPostProvider {
  readonly name = "threads";

  constructor(
    private readonly fetch: Fetch = defaultFetch,
    private readonly wait: (milliseconds: number) => Promise<void> = sleep,
  ) {}

  private call<T>(operation: string, path: string, token: string, values?: Record<string, string | undefined>) {
    return send<T>("Threads", operation, this.fetch, `${API}/${path}`, {
      method: values ? "POST" : "GET",
      headers: { authorization: `Bearer ${token}` },
      ...(values ? { body: form(values) } : {}),
    });
  }

  private async container(
    user: string,
    token: string,
    values: Record<string, string | undefined>,
  ) {
    const created = await this.call<Container>(
      "container creation",
      `${encodeURIComponent(user)}/threads`,
      token,
      values,
    );
    if (!created.id) throw new PublishError("Threads did not return a container ID");
    if (values.media_type === "TEXT") return created.id;
    for (let attempt = 0; attempt < 20; attempt++) {
      const state = await this.call<Container>(
        "status check",
        `${encodeURIComponent(created.id)}?fields=status,error_message`,
        token,
      );
      if (state.status === "FINISHED") return created.id;
      if (state.status === "ERROR" || state.status === "EXPIRED")
        throw new PublishError(
          `Threads could not process the media${state.error_message ? `: ${state.error_message}` : ""}`,
        );
      await this.wait(5_000);
    }
    throw new PublishError("Threads media processing timed out", true);
  }

  async publish({ account, text, media = [] }: PublishContent): Promise<PublishResult> {
    const user = account.accountId;
    const token = account.accessToken;
    const items = await publicUrls("Threads", media);
    let creation: string;
    if (items.length === 0) {
      creation = await this.container(user, token, { media_type: "TEXT", text });
    } else if (items.length === 1) {
      const item = items[0]!;
      creation = await this.container(user, token, {
        text,
        ...(item.video
          ? { media_type: "VIDEO", video_url: item.url }
          : { media_type: "IMAGE", image_url: item.url }),
      });
    } else {
      const children: string[] = [];
      for (const item of items)
        children.push(
          await this.container(user, token, {
            is_carousel_item: "true",
            ...(item.video
              ? { media_type: "VIDEO", video_url: item.url }
              : { media_type: "IMAGE", image_url: item.url }),
          }),
        );
      creation = await this.container(user, token, {
        media_type: "CAROUSEL",
        children: children.join(","),
        text,
      });
    }
    const response = await this.call<{ id?: string }>(
      "publish",
      `${encodeURIComponent(user)}/threads_publish`,
      token,
      { creation_id: creation },
    );
    if (!response.id) throw new PublishError("Threads did not return a post ID");
    return { provider: this.name, response };
  }
}

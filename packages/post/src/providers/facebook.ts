import { ReauthError } from "../lib/errors";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import type { Account, Tokens } from "../lib/types";
import { PublishError } from "../publish/errors";
import { defaultFetch, form, publicUrls, send } from "../publish/request";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../publish/types";

export type FacebookConfig = ProviderConfig & {
  appId: string;
  appSecret: string;
  version?: string;
};

const VERSION = "v26.0";
const SCOPES = ["pages_show_list", "pages_manage_posts", "pages_read_engagement"];
const NEVER_MS = 10 * 365 * 24 * 60 * 60_000;

type Page = {
  id: string;
  name: string;
  access_token: string;
  picture?: { data?: { url?: string } };
};

export class Facebook extends Provider<FacebookConfig> {
  readonly id = "facebook" as const;
  readonly limits = { caption: 63206 };
  readonly accepts = "url" as const;

  private graph(path: string) {
    return `https://graph.facebook.com/${this.config.version ?? VERSION}/${path}`;
  }

  authUrl({ state, redirectUri }: AuthOptions) {
    const url = new URL(
      `https://www.facebook.com/${this.config.version ?? VERSION}/dialog/oauth`,
    );
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
      this.graph("oauth/access_token"),
      {
        query: {
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          redirect_uri: redirectUri,
          code,
        },
      },
    );
    const long = await this.http.json<{ access_token: string }>(
      this.graph("oauth/access_token"),
      {
        query: {
          grant_type: "fb_exchange_token",
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          fb_exchange_token: short.access_token,
        },
      },
    );
    const me = await this.http.json<{ id: string }>(this.graph("me"), {
      query: { fields: "id", access_token: long.access_token },
    });
    const pages = await this.http.json<{ data?: Page[] }>(
      this.graph("me/accounts"),
      {
        query: {
          fields: "id,name,access_token,picture{url}",
          access_token: long.access_token,
        },
      },
    );
    const page = pages.data?.[0];
    if (!page)
      throw this.invalid(
        "No Facebook Page was shared. Connect again and pick a Page you manage",
      );
    return {
      id: page.id,
      name: page.name,
      avatarUrl: page.picture?.data?.url,
      userId: me.id,
      tokens: {
        accessToken: page.access_token,
        expiresAt: new Date(Date.now() + NEVER_MS),
        accountId: page.id,
      },
    };
  }

  async refresh(): Promise<Tokens> {
    throw new ReauthError("The Facebook Page connection expired; connect again", {
      provider: this.id,
    });
  }

  async revoke(): Promise<void> {}
}

export class FacebookProvider implements CrossPostProvider {
  readonly name = "facebook";

  constructor(
    private readonly fetch: Fetch = defaultFetch,
    private readonly version = VERSION,
  ) {}

  private post<T>(operation: string, path: string, token: string, values: Record<string, string | undefined>) {
    return send<T>(
      "Facebook",
      operation,
      this.fetch,
      `https://graph.facebook.com/${this.version}/${path}`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: form(values),
      },
    );
  }

  async publish({ account, text, media = [] }: PublishContent): Promise<PublishResult> {
    const page = encodeURIComponent(account.accountId);
    const token = account.accessToken;
    const items = await publicUrls("Facebook", media);
    if (items.length === 1 && items[0]!.video) {
      const response = await this.post<{ id?: string }>(
        "video upload",
        `${page}/videos`,
        token,
        { file_url: items[0]!.url, description: text },
      );
      if (!response.id) throw new PublishError("Facebook did not return a video ID");
      return { provider: this.name, response };
    }
    if (items.some((item) => item.video))
      throw new PublishError("Facebook takes a video on its own");
    const photos: string[] = [];
    for (const item of items) {
      const photo = await this.post<{ id?: string }>(
        "photo upload",
        `${page}/photos`,
        token,
        { url: item.url, published: "false" },
      );
      if (!photo.id) throw new PublishError("Facebook did not return a photo ID");
      photos.push(photo.id);
    }
    const values: Record<string, string> = { message: text };
    photos.forEach((id, index) => {
      values[`attached_media[${index}]`] = JSON.stringify({ media_fbid: id });
    });
    const response = await this.post<{ id?: string }>(
      "post",
      `${page}/feed`,
      token,
      values,
    );
    if (!response.id) throw new PublishError("Facebook did not return a post ID");
    return { provider: this.name, response };
  }
}

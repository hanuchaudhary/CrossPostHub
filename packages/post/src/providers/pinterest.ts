import { ReauthError } from "../lib/errors";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import type { Account, Tokens } from "../lib/types";
import { PublishError } from "../publish/errors";
import { defaultFetch, publicUrls, send } from "../publish/request";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../publish/types";

export type PinterestConfig = ProviderConfig & {
  appId: string;
  appSecret: string;
  api?: string;
};

const API = "https://api.pinterest.com";
const SCOPES = [
  "user_accounts:read",
  "boards:read",
  "boards:write",
  "pins:read",
  "pins:write",
];

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

export class Pinterest extends Provider<PinterestConfig> {
  readonly id = "pinterest" as const;
  readonly limits = { caption: 500 };
  readonly accepts = "url" as const;

  private get api() {
    return this.config.api ?? API;
  }

  private basic() {
    return {
      authorization: `Basic ${btoa(`${this.config.appId}:${this.config.appSecret}`)}`,
    };
  }

  authUrl({ state, redirectUri }: AuthOptions) {
    const url = new URL("https://www.pinterest.com/oauth/");
    url.search = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPES.join(","),
      state,
    }).toString();
    return url.toString();
  }

  async connect({ code, redirectUri }: ConnectOptions): Promise<Account> {
    const tokens = this.tokens(
      await this.http.json<TokenResponse>(`${this.api}/v5/oauth/token`, {
        method: "POST",
        headers: this.basic(),
        form: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          continuous_refresh: "true",
        },
      }),
    );
    const auth = { authorization: `Bearer ${tokens.accessToken}` };
    const user = await this.http.json<{
      id?: string;
      username: string;
      profile_image?: string;
    }>(`${this.api}/v5/user_account`, { headers: auth });
    const boards = await this.http.json<{ items?: { id: string }[] }>(
      `${this.api}/v5/boards`,
      { query: { page_size: 25 }, headers: auth },
    );
    let board = boards.items?.[0]?.id;
    if (!board) {
      const created = await this.http.json<{ id: string }>(`${this.api}/v5/boards`, {
        method: "POST",
        headers: auth,
        json: { name: "CrossPostHub", privacy: "PUBLIC" },
      });
      board = created.id;
    }
    const meta = { boardId: board };
    return {
      id: user.id ?? user.username,
      name: user.username,
      avatarUrl: user.profile_image,
      meta,
      tokens: { ...tokens, accountId: user.id ?? user.username, meta },
    };
  }

  async refresh(tokens: Tokens): Promise<Tokens> {
    if (!tokens.refreshToken)
      throw new ReauthError("Pinterest access expired; connect again", { provider: this.id });
    const response = await this.http.json<TokenResponse>(`${this.api}/v5/oauth/token`, {
      method: "POST",
      headers: this.basic(),
      form: { grant_type: "refresh_token", refresh_token: tokens.refreshToken },
    });
    return {
      ...this.tokens(response, tokens),
      accountId: tokens.accountId,
      meta: tokens.meta,
    };
  }

  async revoke(): Promise<void> {}
}

export class PinterestProvider implements CrossPostProvider {
  readonly name = "pinterest";

  constructor(
    private readonly fetch: Fetch = defaultFetch,
    private readonly api = API,
  ) {}

  async publish({ account, text, media = [] }: PublishContent): Promise<PublishResult> {
    const board = account.meta?.boardId;
    if (!board) throw new PublishError("Pinterest board is missing; connect again");
    const [image] = await publicUrls("Pinterest", media);
    if (!image || image.video || media.length !== 1)
      throw new PublishError("Pinterest needs exactly one photo");
    const title = text.split("\n")[0]!.trim().slice(0, 100);
    const response = await send<{ id?: string }>(
      "Pinterest",
      "pin creation",
      this.fetch,
      `${this.api}/v5/pins`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${account.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          board_id: board,
          ...(title ? { title } : {}),
          description: text.slice(0, 500),
          media_source: { source_type: "image_url", url: image.url },
        }),
      },
    );
    if (!response.id) throw new PublishError("Pinterest did not return a Pin ID");
    return { provider: this.name, response };
  }
}

import { createHash } from "node:crypto";

import { ReauthError } from "../lib/errors";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import type { Account, Tokens } from "../lib/types";
import { PublishError } from "../publish/errors";
import { blobs, defaultFetch, send, sleep } from "../publish/request";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../publish/types";

export type MastodonConfig = ProviderConfig & {
  instance: string;
  clientId: string;
  clientSecret: string;
};

const SCOPES = "read:accounts write:statuses write:media";
const NEVER_MS = 10 * 365 * 24 * 60 * 60_000;

export function mastodonInstance(value: string) {
  const raw = value.trim().replace(/^@?[^@\s]+@(?=[^@\s]+$)/, "");
  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    throw new Error("Enter your Mastodon server, like mastodon.social");
  }
  if (url.protocol !== "https:" || !url.hostname.includes("."))
    throw new Error("Enter your Mastodon server, like mastodon.social");
  return url.origin;
}

export async function registerMastodonApp(
  instance: string,
  redirectUri: string,
  website: string,
  fetcher: Fetch = defaultFetch,
) {
  const app = await send<{ client_id?: string; client_secret?: string }>(
    "Mastodon",
    "app registration",
    fetcher,
    `${instance}/api/v1/apps`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_name: "CrossPostHub",
        redirect_uris: redirectUri,
        scopes: SCOPES,
        website,
      }),
    },
  );
  if (!app.client_id || !app.client_secret)
    throw new Error("That Mastodon server did not register the app");
  return { clientId: app.client_id, clientSecret: app.client_secret };
}

type MastodonAccount = { id: string; username: string; acct: string; avatar?: string };

export class Mastodon extends Provider<MastodonConfig> {
  readonly id = "mastodon" as const;
  readonly limits = { caption: 500 };
  readonly accepts = "stream" as const;

  authUrl({ state, redirectUri, codeVerifier }: AuthOptions) {
    const url = new URL(`${this.config.instance}/oauth/authorize`);
    url.search = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPES,
      state,
      ...(codeVerifier
        ? {
            code_challenge: createHash("sha256").update(codeVerifier).digest("base64url"),
            code_challenge_method: "S256",
          }
        : {}),
    }).toString();
    return url.toString();
  }

  async connect({ code, redirectUri, codeVerifier }: ConnectOptions): Promise<Account> {
    const token = await this.http.json<{ access_token: string }>(
      `${this.config.instance}/oauth/token`,
      {
        method: "POST",
        form: {
          grant_type: "authorization_code",
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: redirectUri,
          scope: SCOPES,
          code_verifier: codeVerifier,
        },
      },
    );
    const me = await this.http.json<MastodonAccount>(
      `${this.config.instance}/api/v1/accounts/verify_credentials`,
      { headers: { authorization: `Bearer ${token.access_token}` } },
    );
    const host = new URL(this.config.instance).hostname;
    const meta = {
      instance: this.config.instance,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
    };
    return {
      id: me.id,
      name: `@${me.username}@${host}`,
      avatarUrl: me.avatar,
      meta,
      tokens: {
        accessToken: token.access_token,
        expiresAt: new Date(Date.now() + NEVER_MS),
        accountId: me.id,
        meta,
      },
    };
  }

  async refresh(): Promise<Tokens> {
    throw new ReauthError("Mastodon access was revoked; connect again", {
      provider: this.id,
    });
  }

  async revoke(tokens: Tokens): Promise<void> {
    await this.http.request(`${this.config.instance}/oauth/revoke`, {
      method: "POST",
      form: {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        token: tokens.accessToken,
      },
    });
  }
}

type Attachment = { id: string; url: string | null };

export class MastodonProvider implements CrossPostProvider {
  readonly name = "mastodon";

  constructor(
    private readonly fetch: Fetch = defaultFetch,
    private readonly wait: (milliseconds: number) => Promise<void> = sleep,
  ) {}

  async publish({ account, text, media = [] }: PublishContent): Promise<PublishResult> {
    const instance = account.meta?.instance;
    if (!instance) throw new PublishError("Mastodon server is missing; connect again");
    const auth = { authorization: `Bearer ${account.accessToken}` };
    const ids: string[] = [];
    for (const [index, file] of (await blobs(media)).entries()) {
      const body = new FormData();
      body.set(
        "file",
        new Blob([file.data], { type: file.contentType }),
        `media-${index}.${file.contentType.split("/")[1] ?? "bin"}`,
      );
      let attachment = await send<Attachment>(
        "Mastodon",
        "media upload",
        this.fetch,
        `${instance}/api/v2/media`,
        { method: "POST", headers: auth, body },
      );
      for (let attempt = 0; !attachment.url && attempt < 30; attempt++) {
        await this.wait(2_000);
        attachment = await send<Attachment>(
          "Mastodon",
          "media status",
          this.fetch,
          `${instance}/api/v1/media/${encodeURIComponent(attachment.id)}`,
          { headers: auth },
        );
      }
      if (!attachment.url) throw new PublishError("Mastodon media processing timed out", true);
      ids.push(attachment.id);
    }
    const response = await send<{ id?: string; url?: string }>(
      "Mastodon",
      "post",
      this.fetch,
      `${instance}/api/v1/statuses`,
      {
        method: "POST",
        headers: {
          ...auth,
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ status: text, media_ids: ids }),
      },
    );
    if (!response.id) throw new PublishError("Mastodon did not return a post ID");
    return { provider: this.name, response };
  }
}

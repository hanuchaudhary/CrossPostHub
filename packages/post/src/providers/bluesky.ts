import { Agent, AtpAgent, RichText } from "@atproto/api";

import { ReauthError } from "../lib/errors";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import type { Account, Tokens } from "../lib/types";
import { PublishError } from "../publish/errors";
import { blobs, defaultFetch } from "../publish/request";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../publish/types";

export type BlueskyConfig = ProviderConfig & { service?: string };

const SERVICE = "https://bsky.social";

function expiryOf(jwt: string) {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp === "number") return new Date(payload.exp * 1000);
  } catch {}
  return new Date(Date.now() + 60 * 60_000);
}

export class Bluesky extends Provider<BlueskyConfig> {
  readonly id = "bluesky" as const;
  readonly limits = { caption: 300 };
  readonly accepts = "stream" as const;
  override readonly connection = "form" as const;

  authUrl(_options: AuthOptions): string {
    throw this.invalid("Bluesky connects with an app password");
  }

  connect(_options: ConnectOptions): Promise<Account> {
    throw this.invalid("Bluesky connects with an app password");
  }

  override async connectForm(input: Record<string, string>): Promise<Account> {
    const identifier = input.identifier?.trim().replace(/^@/, "");
    const password = input.password?.trim();
    if (!identifier || !password)
      throw this.invalid("Enter your Bluesky handle and an app password");
    const agent = new AtpAgent({ service: input.service?.trim() || this.config.service || SERVICE });
    let session;
    try {
      session = (await agent.login({ identifier, password })).data;
    } catch {
      throw this.invalid("Bluesky rejected that handle or app password");
    }
    const profile = await agent
      .getProfile({ actor: session.did })
      .then((result) => result.data)
      .catch(() => null);
    const service = (agent.pdsUrl ?? agent.serviceUrl).toString().replace(/\/$/, "");
    return {
      id: session.did,
      name: `@${session.handle}`,
      avatarUrl: profile?.avatar,
      meta: { service, handle: session.handle },
      tokens: {
        accessToken: session.accessJwt,
        refreshToken: session.refreshJwt,
        expiresAt: expiryOf(session.accessJwt),
        accountId: session.did,
        meta: { service, handle: session.handle },
      },
    };
  }

  async refresh(tokens: Tokens): Promise<Tokens> {
    const service = tokens.meta?.service ?? SERVICE;
    if (!tokens.refreshToken)
      throw new ReauthError("Bluesky session ended; connect again", { provider: this.id });
    const agent = new Agent({
      service,
      headers: { authorization: `Bearer ${tokens.refreshToken}` },
    });
    let data;
    try {
      data = (await agent.com.atproto.server.refreshSession()).data;
    } catch {
      throw new ReauthError("Bluesky session ended; connect again", { provider: this.id });
    }
    return {
      accessToken: data.accessJwt,
      refreshToken: data.refreshJwt,
      expiresAt: expiryOf(data.accessJwt),
      accountId: data.did,
      meta: tokens.meta,
    };
  }

  async revoke(tokens: Tokens): Promise<void> {
    if (!tokens.refreshToken) return;
    const agent = new Agent({
      service: tokens.meta?.service ?? SERVICE,
      headers: { authorization: `Bearer ${tokens.refreshToken}` },
    });
    await agent.com.atproto.server.deleteSession();
  }
}

export class BlueskyProvider implements CrossPostProvider {
  readonly name = "bluesky";

  constructor(private readonly fetch: Fetch = defaultFetch) {}

  async publish({ account, text, media = [] }: PublishContent): Promise<PublishResult> {
    const service = account.meta?.service ?? SERVICE;
    const agent = new Agent({
      service,
      headers: { authorization: `Bearer ${account.accessToken}` },
      fetch: this.fetch as typeof fetch,
    });
    const rich = new RichText({ text });
    await rich.detectFacets(agent).catch(() => rich.detectFacetsWithoutResolution());
    const files = await blobs(media);
    if (files.some((file) => file.video))
      throw new PublishError("Bluesky posts take photos only");
    const images = [];
    for (const file of files) {
      const uploaded = await agent.com.atproto.repo
        .uploadBlob(new Uint8Array(file.data), { encoding: file.contentType })
        .catch(() => {
          throw new PublishError("Bluesky photo upload failed", true);
        });
      images.push({ image: uploaded.data.blob, alt: "" });
    }
    const response = await agent.com.atproto.repo
      .createRecord({
        repo: account.accountId,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: rich.text,
          facets: rich.facets,
          createdAt: new Date().toISOString(),
          ...(images.length
            ? { embed: { $type: "app.bsky.embed.images", images } }
            : {}),
        },
      })
      .catch((error: { status?: number; message?: string }) => {
        throw new PublishError(
          `Bluesky post failed${error.message ? `: ${error.message}` : ""}`,
          error.status === undefined || error.status >= 500 || error.status === 429,
        );
      });
    return { provider: this.name, response: response.data };
  }
}

import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../types";

export interface InstagramProviderOptions {
  apiVersion?: string;
  wait?: (milliseconds: number) => Promise<void>;
}

interface InstagramResponse {
  id?: string;
  status_code?: string;
  error?: { code?: number; error_subcode?: number };
}

export class InstagramProvider implements CrossPostProvider {
  readonly name = "instagram";
  private readonly baseUrl: string;
  private readonly wait: (milliseconds: number) => Promise<void>;

  constructor(
    private readonly fetch: Fetch = globalThis.fetch.bind(globalThis),
    options: InstagramProviderOptions = {},
  ) {
    const version = options.apiVersion ?? "v25.0";
    if (!/^v\d+\.\d+$/.test(version))
      throw new Error("Invalid Instagram API version");
    this.baseUrl = `https://graph.instagram.com/${version}`;
    this.wait =
      options.wait ??
      ((milliseconds) =>
        new Promise((resolve) => setTimeout(resolve, milliseconds)));
  }

  private async request(
    path: string,
    accessToken: string,
    parameters?: Record<string, string>,
  ): Promise<InstagramResponse> {
    const response = await this.fetch(`${this.baseUrl}/${path}`, {
      method: parameters ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(parameters
          ? { "content-type": "application/x-www-form-urlencoded" }
          : {}),
      },
      ...(parameters
        ? { body: new URLSearchParams(parameters).toString() }
        : {}),
    });
    const body = (await response
      .json()
      .catch(() => null)) as InstagramResponse | null;
    if (!response.ok || body?.error) {
      const code = body?.error?.code;
      const subcode = body?.error?.error_subcode;
      throw new Error(
        `Instagram request failed (${response.status}${code !== undefined ? `, code ${code}` : ""}${subcode !== undefined ? `, subcode ${subcode}` : ""})`,
      );
    }
    if (!body || typeof body !== "object")
      throw new Error("Invalid Instagram API response");
    return body;
  }

  private async createContainer(
    accountId: string,
    accessToken: string,
    parameters: Record<string, string>,
  ): Promise<string> {
    const body = await this.request(
      `${encodeURIComponent(accountId)}/media`,
      accessToken,
      parameters,
    );
    if (!body.id || typeof body.id !== "string")
      throw new Error("Instagram did not return a media container ID");
    await this.waitUntilReady(body.id, accessToken);
    return body.id;
  }

  private async waitUntilReady(
    containerId: string,
    accessToken: string,
  ): Promise<void> {
    for (let attempt = 0; attempt < 6; attempt++) {
      if (attempt > 0) await this.wait(60_000);
      const body = await this.request(
        `${encodeURIComponent(containerId)}?fields=status_code`,
        accessToken,
      );
      if (body.status_code === "FINISHED") return;
      if (body.status_code !== "IN_PROGRESS") {
        throw new Error(
          `Instagram media processing failed (${body.status_code ?? "missing status"})`,
        );
      }
    }
    throw new Error("Instagram media processing timed out");
  }

  async publish({
    account,
    text,
    media = [],
  }: PublishContent): Promise<PublishResult> {
    if (media.length === 0 || media.length > 10) {
      throw new Error("Instagram publishing requires 1 to 10 media items");
    }
    const items = await Promise.all(
      media.map(async (item) => {
        if (!item.getPublicUrl)
          throw new Error("Instagram media requires a public URL");
        const source = await item.getPublicUrl();
        let url: URL;
        try {
          url = new URL(source.url);
        } catch {
          throw new Error("Instagram media requires a valid public HTTPS URL");
        }
        if (url.protocol !== "https:" || url.username || url.password) {
          throw new Error("Instagram media requires a valid public HTTPS URL");
        }
        const contentType = source.contentType
          .split(";")[0]!
          .trim()
          .toLowerCase();
        const video =
          contentType === "video/mp4" || contentType === "video/quicktime";
        if (contentType !== "image/jpeg" && !video)
          throw new Error("Instagram supports JPEG images and MP4/MOV Reels");
        return { url: source.url, video };
      }),
    );
    if (items.length > 1 && items.some((item) => item.video)) {
      throw new Error(
        "Instagram carousels currently support JPEG images only; publish a video as a single Reel",
      );
    }

    let creationId: string;
    if (items.length === 1) {
      const item = items[0]!;
      creationId = await this.createContainer(
        account.accountId,
        account.accessToken,
        {
          caption: text,
          ...(item.video
            ? { media_type: "REELS", video_url: item.url }
            : { image_url: item.url }),
        },
      );
    } else {
      const children: string[] = [];
      for (const item of items) {
        children.push(
          await this.createContainer(account.accountId, account.accessToken, {
            image_url: item.url,
            is_carousel_item: "true",
          }),
        );
      }
      creationId = await this.createContainer(
        account.accountId,
        account.accessToken,
        {
          media_type: "CAROUSEL",
          caption: text,
          children: children.join(","),
        },
      );
    }
    const response = await this.request(
      `${encodeURIComponent(account.accountId)}/media_publish`,
      account.accessToken,
      {
        creation_id: creationId,
      },
    );
    if (!response.id || typeof response.id !== "string")
      throw new Error("Instagram did not return a published media ID");
    return { provider: this.name, response };
  }
}

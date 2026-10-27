import {
  ApiError,
  Client,
  HttpClient,
  type HttpClientRequestOptions,
  type Media,
} from "@xdevplatform/xdk";
import { PublishError, providerHttpError } from "../errors";
import { base64, cancelMedia, mediaChunks, openMedia } from "../media";
import type {
  CrossPostProvider,
  Fetch,
  MediaSource,
  PublishContent,
  PublishResult,
} from "../types";

class FetchTransport extends HttpClient {
  constructor(private readonly transport: Fetch) {
    super();
  }
  override async request(url: string, options: HttpClientRequestOptions = {}) {
    return this.transport(url, {
      method: options.method,
      headers: options.headers,
      body: options.body as BodyInit | undefined,
      signal: options.signal ?? AbortSignal.timeout(options.timeout ?? 30_000),
    });
  }
}
class XClient extends Client {
  override readonly httpClient: HttpClient;
  constructor(accessToken: string, transport: Fetch) {
    super({ accessToken, retry: false, timeout: 30_000 });
    this.httpClient = new FetchTransport(transport);
  }
}

export interface TwitterProviderOptions {
  wait?: (milliseconds: number) => Promise<void>;
}
type ProcessingInfo = { state?: string; checkAfterSecs?: number };
const CHUNK_SIZE = 5 * 1024 * 1024;

export class TwitterProvider implements CrossPostProvider {
  readonly name = "twitter";
  private readonly wait: (milliseconds: number) => Promise<void>;
  constructor(
    private readonly fetch: Fetch = globalThis.fetch.bind(globalThis),
    options: TwitterProviderOptions = {},
  ) {
    this.wait =
      options.wait ??
      ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  private category(
    source: MediaSource,
  ): Media.InitializeUploadRequest["mediaCategory"] {
    const mime = source.contentType.split(";")[0]!.trim().toLowerCase();
    const image = ["image/jpeg", "image/png", "image/webp"].includes(mime);
    const gif = mime === "image/gif";
    if (!image && !gif && mime !== "video/mp4")
      throw new PublishError(
        "X supports JPEG/PNG/WebP images, GIFs, and MP4 videos",
      );
    const limit = image
      ? 5 * 1024 ** 2
      : gif
        ? 15 * 1024 ** 2
        : 200 * 1024 ** 2;
    if (
      !Number.isSafeInteger(source.size) ||
      source.size <= 0 ||
      source.size > limit
    )
      throw new PublishError(
        `X media exceeds the supported size (maximum ${limit / 1024 ** 2} MB)`,
      );
    return image ? "tweet_image" : gif ? "tweet_gif" : "tweet_video";
  }

  private async waitForMedia(
    client: Client,
    id: string,
    info?: ProcessingInfo,
  ): Promise<void> {
    let elapsed = 0;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (!info || info.state === "succeeded") return;
      if (!["pending", "in_progress"].includes(info.state ?? ""))
        throw new PublishError("X media processing failed");
      const seconds = Math.max(1, Math.min(60, info.checkAfterSecs ?? 1));
      elapsed += seconds;
      if (elapsed > 300) break;
      await this.wait(seconds * 1000);
      const status = await client.media.getUploadStatus(id);
      if (!status.data || status.errors?.length)
        throw new PublishError(
          "X returned an invalid media status response",
          true,
        );
      info = status.data.processingInfo;
    }
    throw new PublishError("X media processing timed out", true);
  }

  private async upload(client: Client, source: MediaSource): Promise<string> {
    const initialized = await client.media.initializeUpload({
      mediaCategory: this.category(source),
      mediaType: source.contentType
        .split(";")[0]!
        .trim()
        .toLowerCase() as Media.InitializeUploadRequest["mediaType"],
      totalBytes: source.size,
    });
    const id = initialized.data?.id;
    if (!id || initialized.errors?.length)
      throw new PublishError("X did not return a media upload ID", true);
    let segmentIndex = 0;
    for await (const chunk of mediaChunks(source, CHUNK_SIZE)) {
      const appended = await client.media.appendUpload(id, {
        media: base64(chunk),
        segmentIndex: segmentIndex++,
      });
      if (appended?.errors?.length)
        throw new PublishError("X media segment upload failed", true);
    }
    const finalized = await client.media.finalizeUpload(id);
    if (!finalized.data?.id || finalized.errors?.length)
      throw new PublishError(
        "X returned an invalid media finalization response",
        true,
      );
    await this.waitForMedia(client, id, finalized.data.processingInfo);
    return id;
  }

  async publish({
    account,
    text,
    media = [],
  }: PublishContent): Promise<PublishResult> {
    if (!text.trim() && !media.length)
      throw new PublishError("X requires text or media");
    if (media.length > 4)
      throw new PublishError(
        "X supports at most 4 images or a single GIF/video per post",
      );
    const sources: MediaSource[] = [];
    try {
      for (const item of media) sources.push(await openMedia(item));
      const categories = sources.map((source) => this.category(source));
      if (
        sources.length > 1 &&
        categories.some((category) => category !== "tweet_image")
      )
        throw new PublishError(
          "X supports at most 4 images or a single GIF/video per post",
        );
      const client = new XClient(account.accessToken, this.fetch);
      const mediaIds: string[] = [];
      for (const source of sources)
        mediaIds.push(await this.upload(client, source));
      const response = await client.posts.create({
        ...(text ? { text } : {}),
        ...(mediaIds.length ? { media: { mediaIds } } : {}),
      });
      if (!response.data?.id || response.errors?.length)
        throw new PublishError(
          "X did not confirm that the post was created",
          true,
        );
      return { provider: this.name, response };
    } catch (error) {
      if (error instanceof ApiError)
        throw providerHttpError("X", "publish", error.status, error.headers);
      throw error;
    } finally {
      await cancelMedia(sources);
    }
  }
}

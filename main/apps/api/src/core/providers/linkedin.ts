import { PublishError, providerHttpError } from "../errors";
import { cancelMedia, mediaChunks, openMedia } from "../media";
import type {
  CrossPostProvider,
  Fetch,
  MediaSource,
  PublishContent,
  PublishResult,
} from "../types";

export interface LinkedInProviderOptions {
  apiVersion?: string;
  wait?: (milliseconds: number) => Promise<void>;
}
interface ImageUpload {
  value: { image: string; uploadUrl: string };
}
interface VideoUpload {
  value: {
    video: string;
    uploadToken: string;
    uploadInstructions: {
      uploadUrl: string;
      firstByte: number;
      lastByte: number;
    }[];
  };
}

export class LinkedInProvider implements CrossPostProvider {
  readonly name = "linkedin";
  private readonly apiVersion: string;
  private readonly wait: (milliseconds: number) => Promise<void>;
  constructor(
    private readonly fetch: Fetch = globalThis.fetch.bind(globalThis),
    options: LinkedInProviderOptions = {},
  ) {
    this.apiVersion = options.apiVersion ?? "202610";
    if (!/^\d{4}(0[1-9]|1[0-2])$/.test(this.apiVersion))
      throw new Error("Invalid LinkedIn API version");
    this.wait =
      options.wait ??
      ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  private async request(
    path: string,
    accessToken: string,
    body?: unknown,
  ): Promise<Response> {
    const response = await this.fetch(`https://api.linkedin.com/rest/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        "LinkedIn-Version": this.apiVersion,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw providerHttpError(
        "LinkedIn",
        path.split("?")[0]!,
        response.status,
        response.headers,
      );
    return response;
  }

  private validate(source: MediaSource): "image" | "video" {
    const mime = source.contentType.split(";")[0]!.trim().toLowerCase();
    if (!["image/jpeg", "image/png", "image/gif", "video/mp4"].includes(mime))
      throw new PublishError(
        "LinkedIn supports JPEG/PNG/GIF images and MP4 videos",
      );
    if (
      !Number.isSafeInteger(source.size) ||
      source.size <= 0 ||
      source.size > 200 * 1024 ** 2
    )
      throw new PublishError(
        "LinkedIn media must be between 1 byte and the app's 200 MB upload limit",
      );
    return mime === "video/mp4" ? "video" : "image";
  }

  private uploadUrl(value: string): string {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new PublishError("LinkedIn returned an invalid upload URL");
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !["linkedin.com", "linkedin-ei.com"].some(
        (domain) =>
          url.hostname === domain || url.hostname.endsWith(`.${domain}`),
      )
    )
      throw new PublishError("LinkedIn returned an untrusted upload URL");
    return url.toString();
  }

  private async uploadImage(
    source: MediaSource,
    owner: string,
    accessToken: string,
  ): Promise<string> {
    const initialized = await this.request(
      "images?action=initializeUpload",
      accessToken,
      { initializeUploadRequest: { owner } },
    );
    const body = (await initialized.json()) as ImageUpload;
    if (
      !body.value?.image?.startsWith("urn:li:image:") ||
      !body.value.uploadUrl
    )
      throw new PublishError(
        "LinkedIn returned an invalid image upload response",
        true,
      );
    const uploaded = await this.fetch(this.uploadUrl(body.value.uploadUrl), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": source.contentType,
      },
      body: source.stream,
      signal: AbortSignal.timeout(60_000),
    });
    if (!uploaded.ok)
      throw providerHttpError(
        "LinkedIn",
        "image upload",
        uploaded.status,
        uploaded.headers,
      );
    return body.value.image;
  }

  private async uploadVideo(
    source: MediaSource,
    owner: string,
    accessToken: string,
  ): Promise<string> {
    const response = await this.request(
      "videos?action=initializeUpload",
      accessToken,
      {
        initializeUploadRequest: {
          owner,
          fileSizeBytes: source.size,
          uploadCaptions: false,
          uploadThumbnail: false,
        },
      },
    );
    const { value } = (await response.json()) as VideoUpload;
    if (
      !value?.video?.startsWith("urn:li:video:") ||
      !Array.isArray(value.uploadInstructions) ||
      !value.uploadInstructions.length ||
      typeof value.uploadToken !== "string"
    )
      throw new PublishError(
        "LinkedIn returned an invalid video upload response",
        true,
      );
    let offset = 0;
    const sizes = value.uploadInstructions.map((instruction) => {
      this.uploadUrl(instruction.uploadUrl);
      if (
        !Number.isSafeInteger(instruction.firstByte) ||
        !Number.isSafeInteger(instruction.lastByte) ||
        instruction.firstByte !== offset ||
        instruction.lastByte < offset
      )
        throw new PublishError("LinkedIn returned invalid video byte ranges");
      const size = Math.min(source.size - 1, instruction.lastByte) - offset + 1;
      if (size <= 0 || size > 5 * 1024 ** 2)
        throw new PublishError(
          "LinkedIn returned unsupported video part sizes",
        );
      offset += size;
      return size;
    });
    if (offset !== source.size)
      throw new PublishError(
        "LinkedIn video ranges do not cover the complete file",
      );
    const uploadedPartIds: string[] = [];
    let part = 0;
    for await (const chunk of mediaChunks(source, sizes)) {
      const instruction = value.uploadInstructions[part++]!;
      const uploaded = await this.fetch(this.uploadUrl(instruction.uploadUrl), {
        method: "PUT",
        headers: { "content-type": "application/octet-stream" },
        body: chunk,
        signal: AbortSignal.timeout(60_000),
      });
      if (!uploaded.ok)
        throw providerHttpError(
          "LinkedIn",
          "video upload",
          uploaded.status,
          uploaded.headers,
        );
      const etag = uploaded.headers.get("etag");
      if (!etag)
        throw new PublishError(
          "LinkedIn video upload did not return an ETag",
          true,
        );
      uploadedPartIds.push(etag.replace(/^"|"$/g, ""));
    }
    await this.request("videos?action=finalizeUpload", accessToken, {
      finalizeUploadRequest: {
        video: value.video,
        uploadToken: value.uploadToken,
        uploadedPartIds,
      },
    });
    for (let attempt = 0; attempt < 61; attempt++) {
      const statusResponse = await this.request(
        `videos/${encodeURIComponent(value.video)}`,
        accessToken,
      );
      const { status } = (await statusResponse.json()) as { status?: string };
      if (status === "AVAILABLE") return value.video;
      if (!["WAITING_UPLOAD", "PROCESSING"].includes(status ?? ""))
        throw new PublishError("LinkedIn video processing failed");
      if (attempt < 60) await this.wait(5_000);
    }
    throw new PublishError("LinkedIn video processing timed out", true);
  }

  async publish({
    account,
    text,
    media = [],
  }: PublishContent): Promise<PublishResult> {
    if (!text.trim() && !media.length)
      throw new PublishError("LinkedIn requires text or media");
    if ([...text].length > 3000)
      throw new PublishError(
        "LinkedIn commentary cannot exceed 3000 characters",
      );
    if (media.length > 20)
      throw new PublishError(
        "LinkedIn supports at most 20 images or one video per post",
      );
    const owner = account.accountId.startsWith("urn:li:person:")
      ? account.accountId
      : `urn:li:person:${account.accountId}`;
    const sources: MediaSource[] = [];
    try {
      for (const item of media) sources.push(await openMedia(item));
      const kinds = sources.map((source) => this.validate(source));
      if (sources.length > 1 && kinds.includes("video"))
        throw new PublishError("LinkedIn videos must be published alone");
      const assets: string[] = [];
      for (let index = 0; index < sources.length; index++) {
        assets.push(
          await (kinds[index] === "video"
            ? this.uploadVideo(sources[index]!, owner, account.accessToken)
            : this.uploadImage(sources[index]!, owner, account.accessToken)),
        );
      }
      const content =
        assets.length > 1
          ? { multiImage: { images: assets.map((id) => ({ id })) } }
          : assets.length
            ? { media: { id: assets[0] } }
            : undefined;
      const response = await this.request("posts", account.accessToken, {
        author: owner,
        commentary: text.replace(/([\\|{}@\[\]()<>#*_~])/g, "\\$1"),
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
        ...(content ? { content } : {}),
      });
      const id = response.headers.get("x-restli-id");
      if (!id)
        throw new PublishError(
          "LinkedIn did not return the created post ID",
          true,
        );
      return { provider: this.name, response: { id } };
    } finally {
      await cancelMedia(sources);
    }
  }
}

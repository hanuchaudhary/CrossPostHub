import { PostError, ReauthError, ValidationError } from "../lib/errors";
import type { HttpFailure } from "../lib/http";
import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import { chunks } from "../lib/stream";
import type { Account, PostInput, PostStatus, Tokens } from "../lib/types";

export type LinkedInConfig = ProviderConfig & {
  clientId: string;
  clientSecret: string;
  /** The `Linkedin-Version` header, YYYYMM. LinkedIn keeps each version for about a year. */
  version?: string;
};

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const REVOKE_URL = "https://www.linkedin.com/oauth/v2/revoke";
const API = "https://api.linkedin.com";
const VERSION = "202611";
const SCOPES = ["openid", "profile", "w_member_social"];
const PROCESSING_POLL_MS = 10_000;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};
type UserInfo = { sub: string; name: string; picture?: string };
type UploadInstruction = { uploadUrl: string; firstByte: number; lastByte: number };
type InitializeResponse = {
  value: {
    video: string;
    uploadToken?: string;
    uploadInstructions: UploadInstruction[];
  };
};
type Video = {
  status: "WAITING_UPLOAD" | "PROCESSING" | "PROCESSING_FAILED" | "AVAILABLE";
  processingFailureReason?: string;
};
/** What `status` needs to create the post once the video is ready; kept as the job's `ref`. */
type Pending = { video: string; post: Record<string, unknown> };

/**
 * LinkedIn Posts API, posting as the signed-in member. The video is uploaded in parts,
 * processed by LinkedIn, and only then attached to a post, so `publish` returns `processing`
 * and `status` creates the post once the video is AVAILABLE.
 */
export class LinkedIn extends Provider<LinkedInConfig> {
  readonly id = "linkedin" as const;
  readonly limits = { caption: 3000 };
  readonly accepts = "stream" as const;

  authUrl({ state, redirectUri }: AuthOptions) {
    const url = new URL(AUTH_URL);
    url.search = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: SCOPES.join(" "),
      state,
    }).toString();
    return url.toString();
  }

  async connect({ code, redirectUri }: ConnectOptions): Promise<Account> {
    const tokens = this.tokens(
      await this.http.json<TokenResponse>(TOKEN_URL, {
        method: "POST",
        form: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
      })
    );
    const me = await this.http.json<UserInfo>(`${API}/v2/userinfo`, {
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });
    // The OpenID `sub` is the member id that `urn:li:person:{id}` takes.
    return {
      id: me.sub,
      name: me.name,
      avatarUrl: me.picture,
      tokens: { ...tokens, accountId: me.sub },
    };
  }

  /** Only LinkedIn partner apps get refresh tokens; everyone else connects again after 60 days. */
  async refresh(tokens: Tokens): Promise<Tokens> {
    if (!tokens.refreshToken) {
      throw new ReauthError("LinkedIn access expired; connect again", {
        provider: this.id,
      });
    }
    const response = await this.http.json<TokenResponse>(TOKEN_URL, {
      method: "POST",
      form: {
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      },
    });
    return { ...this.tokens(response, tokens), accountId: tokens.accountId };
  }

  async revoke(tokens: Tokens): Promise<void> {
    await this.http.request(REVOKE_URL, {
      method: "POST",
      form: {
        token: tokens.accessToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      },
    });
  }

  override async publish(tokens: Tokens, input: PostInput): Promise<PostStatus> {
    this.validate(input);
    if (!("stream" in input.video)) throw this.invalid("The video must be given as a stream");
    const author = this.author(tokens);
    const { stream, size } = input.video;

    const { value } = await this.http.json<InitializeResponse>(
      `${API}/rest/videos?action=initializeUpload`,
      {
        method: "POST",
        headers: this.headers(tokens),
        json: {
          initializeUploadRequest: {
            owner: author,
            fileSizeBytes: size,
            uploadCaptions: false,
            uploadThumbnail: false,
          },
        },
      }
    );

    const partIds = await this.upload(value.uploadInstructions, stream, tokens);
    await this.http.request(`${API}/rest/videos?action=finalizeUpload`, {
      method: "POST",
      headers: this.headers(tokens),
      json: {
        finalizeUploadRequest: {
          video: value.video,
          uploadToken: value.uploadToken ?? "",
          uploadedPartIds: partIds,
        },
      },
    });

    const pending: Pending = {
      video: value.video,
      post: {
        author,
        commentary: littleText(input.caption),
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        content: {
          media: {
            id: value.video,
            ...(input.title?.trim() ? { title: input.title.trim() } : {}),
          },
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      },
    };
    return { state: "processing", ref: JSON.stringify(pending), retryInMs: PROCESSING_POLL_MS };
  }

  /** Waits for LinkedIn to process the video, then creates the post that shows it. */
  override async status(tokens: Tokens, ref: string): Promise<PostStatus> {
    const pending = JSON.parse(ref) as Pending;
    const video = await this.http.json<Video>(
      `${API}/rest/videos/${encodeURIComponent(pending.video)}`,
      { headers: this.headers(tokens) }
    );
    if (video.status === "PROCESSING_FAILED") {
      throw new ValidationError(
        `LinkedIn could not process the video${video.processingFailureReason ? `: ${video.processingFailureReason}` : ""}`,
        { provider: this.id }
      );
    }
    if (video.status !== "AVAILABLE") {
      return { state: "processing", ref, retryInMs: PROCESSING_POLL_MS };
    }

    const response = await this.http.request(`${API}/rest/posts`, {
      method: "POST",
      headers: this.headers(tokens),
      json: pending.post,
    });
    const urn = response.headers.get("x-restli-id");
    if (!urn) throw new PostError("LinkedIn did not return the post id", { provider: this.id });
    return {
      state: "published",
      id: urn,
      url: `https://www.linkedin.com/feed/update/${urn}/`,
    };
  }

  /** PUTs each part to its signed URL; the ETags that come back, in order, finalize the upload. */
  private async upload(
    instructions: UploadInstruction[],
    stream: ReadableStream<Uint8Array>,
    tokens: Tokens
  ) {
    const ordered = [...instructions].sort((a, b) => a.firstByte - b.firstByte);
    const partSize = ordered[0]!.lastByte - ordered[0]!.firstByte + 1;
    const partIds: string[] = [];
    let index = 0;
    for await (const chunk of chunks(stream, partSize)) {
      const part = ordered[index++];
      if (!part || chunk.byteLength !== part.lastByte - part.firstByte + 1) {
        throw new PostError("The video did not match LinkedIn's upload parts", {
          provider: this.id,
        });
      }
      const response = await this.http.request(part.uploadUrl, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
          "content-type": "application/octet-stream",
        },
        body: chunk,
        retries: 2,
      });
      const etag = response.headers.get("etag");
      if (!etag) throw new PostError("LinkedIn did not confirm an upload part", { provider: this.id });
      partIds.push(etag);
    }
    if (index !== ordered.length) {
      throw new PostError(`The video ended after ${index} of ${ordered.length} parts`, {
        provider: this.id,
      });
    }
    return partIds;
  }

  protected override mapError(failure: HttpFailure) {
    const details = { provider: this.id, status: failure.status, code: serviceCode(failure.body) };
    if (failure.status === 403) {
      return new ReauthError(
        "LinkedIn refused this account's access to posting; connect it again",
        details
      );
    }
    return super.mapError(failure);
  }

  private author(tokens: Tokens) {
    if (!tokens.accountId) {
      throw new ReauthError("The LinkedIn member is unknown; connect again", { provider: this.id });
    }
    return `urn:li:person:${tokens.accountId}`;
  }

  private headers(tokens: Tokens) {
    return {
      authorization: `Bearer ${tokens.accessToken}`,
      "linkedin-version": this.config.version ?? VERSION,
      "x-restli-protocol-version": "2.0.0",
    };
  }
}

function serviceCode(body: unknown) {
  if (!body || typeof body !== "object") return undefined;
  const code = (body as { code?: unknown; serviceErrorCode?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

const RESERVED = /[\\|{}@[\]()<>*_~]/g;

/**
 * `commentary` is LinkedIn "little text": reserved characters must be escaped or the post is cut
 * off at them, and a hashtag is written as `{hashtag|\#|word}`.
 */
export function littleText(text: string) {
  return text
    .split(/(#[\p{L}\p{N}_]+)/u)
    .map((part, index) =>
      index % 2 === 1
        ? `{hashtag|\\#|${part.slice(1).replace(RESERVED, "\\$&")}}`
        : part.replace(RESERVED, "\\$&").replace(/#/g, "\\#")
    )
    .join("");
}

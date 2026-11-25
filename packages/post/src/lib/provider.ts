import { LimitError, PostError, ReauthError, ValidationError } from "./errors";
import { errorMessage, Http, type HttpFailure } from "./http";
import type { Account, Limits, PostInput, PostStatus, ProviderId, Tokens } from "./types";

export type AuthOptions = { state: string; redirectUri: string; codeVerifier?: string };
export type ConnectOptions = { code: string; redirectUri: string; codeVerifier?: string };

export type ProviderConfig = {
  /** Replaces the global fetch, for tests or a proxy. */
  fetch?: typeof fetch;
};

/**
 * One social platform. A subclass holds only that platform's endpoints and
 * field names; HTTP, error mapping, validation and token expiry live here.
 */
export abstract class Provider<Config extends ProviderConfig = ProviderConfig> {
  abstract readonly id: ProviderId;
  abstract readonly limits: Limits;
  /** How the video must be handed over: as a URL the platform downloads, or as a stream of bytes. */
  abstract readonly accepts: "url" | "stream";

  protected readonly http: Http;

  constructor(protected readonly config: Config) {
    this.http = new Http((failure) => this.mapError(failure), config.fetch);
  }

  /**
   * Where to send the user to grant access. `codeVerifier` is the PKCE secret for this attempt:
   * providers that use PKCE (X) send its challenge here and the verifier itself in `connect`.
   */
  abstract authUrl(options: AuthOptions): string;
  /** Exchanges the code from the redirect for tokens and the account's profile. */
  abstract connect(options: ConnectOptions): Promise<Account>;
  abstract refresh(tokens: Tokens): Promise<Tokens>;
  abstract revoke(tokens: Tokens): Promise<void>;
  abstract publish(tokens: Tokens, input: PostInput): Promise<PostStatus>;
  /** Follows up a post that came back `processing`. */
  abstract status(tokens: Tokens, ref: string): Promise<PostStatus>;

  /**
   * Throws a ValidationError when `input` can never be posted here as it is.
   * The video is optional, so the text can be checked before the post is queued.
   */
  validate(input: Omit<PostInput, "video"> & { video?: PostInput["video"] }): void {
    const { title, caption, hashtags } = this.limits;
    if (title !== undefined) {
      const length = input.title?.trim().length ?? 0;
      if (length === 0) throw this.invalid("A title is required");
      if (length > title) throw this.invalid(`The title is longer than ${title} characters`);
    }
    if (input.caption.length > caption) {
      throw this.invalid(`The caption is longer than ${caption} characters`);
    }
    if (hashtags !== undefined && (input.caption.match(/#[\p{L}\p{N}_]+/gu)?.length ?? 0) > hashtags) {
      throw this.invalid(`The caption has more than ${hashtags} hashtags`);
    }
    if (input.video && !(this.accepts in input.video)) {
      throw this.invalid(`The video must be given as a ${this.accepts}`);
    }
  }

  /** True when the access token expires within `withinMs`. */
  needsRefresh(tokens: Tokens, withinMs = 5 * 60_000): boolean {
    return tokens.expiresAt.getTime() - Date.now() < withinMs;
  }

  /** Tokens from an OAuth token response. Keeps the old refresh token when none comes back. */
  protected tokens(
    response: { access_token: string; expires_in: number; refresh_token?: string },
    previous?: Tokens
  ): Tokens {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token ?? previous?.refreshToken,
      expiresAt: new Date(Date.now() + response.expires_in * 1000),
    };
  }

  /** Maps a failed response to a typed error. Override to read a platform's own codes, then fall back here. */
  protected mapError({ status, body, headers }: HttpFailure): PostError {
    const details = { provider: this.id, status };
    const message = errorMessage(body) ?? `${this.id} answered HTTP ${status}`;
    if (status === 401) return new ReauthError(message, details);
    if (status === 429) {
      const seconds = Number(headers.get("retry-after"));
      return new LimitError(message, {
        ...details,
        retryAfterMs: Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined,
      });
    }
    return new PostError(message, details);
  }

  protected invalid(message: string) {
    return new ValidationError(message, { provider: this.id });
  }
}

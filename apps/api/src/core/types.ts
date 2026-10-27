export interface PublishMedia {
  load(): Promise<{ data: ArrayBuffer; contentType: string }>;
  getPublicUrl?(): Promise<{ url: string; contentType: string }>;
  open?(): Promise<MediaSource>;
}

export interface MediaSource {
  stream: ReadableStream<Uint8Array>;
  size: number;
  contentType: string;
}

export interface PublishAccount {
  accessToken: string;
  accountId: string;
}

export interface PublishContent {
  account: PublishAccount;
  text: string;
  media?: readonly PublishMedia[];
}

export interface PublishRequest extends PublishContent {
  provider: string;
}

export interface PublishResult {
  provider: string;
  response: unknown;
}

export interface CrossPostProvider {
  readonly name: string;
  publish(content: PublishContent): Promise<PublishResult>;
}

export type Fetch = (
  ...args: Parameters<typeof globalThis.fetch>
) => ReturnType<typeof globalThis.fetch>;

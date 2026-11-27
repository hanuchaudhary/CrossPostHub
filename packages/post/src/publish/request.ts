import { errorMessage } from "../lib/http";
import { providerHttpError, PublishError } from "./errors";
import type { Fetch, PublishMedia } from "./types";

export const defaultFetch: Fetch = (input, init) => fetch(input, init);

export const sleep = (milliseconds: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function send<T>(
  provider: string,
  operation: string,
  fetcher: Fetch,
  url: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(url, init);
  } catch {
    throw new PublishError(`${provider} ${operation} could not be reached`, true);
  }
  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const error = providerHttpError(
      provider,
      operation,
      response.status,
      response.headers,
    );
    const detail = errorMessage(body);
    if (detail) error.message = `${error.message}: ${detail}`;
    throw error;
  }
  return body as T;
}

export function form(values: Record<string, string | undefined>) {
  return new URLSearchParams(
    Object.entries(values).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
}

export async function publicUrls(provider: string, media: readonly PublishMedia[]) {
  return Promise.all(
    media.map(async (item) => {
      if (!item.getPublicUrl)
        throw new PublishError(`${provider} media requires a public URL`);
      const source = await item.getPublicUrl();
      const contentType = source.contentType.split(";")[0]!.trim().toLowerCase();
      return {
        url: source.url,
        contentType,
        video: contentType.startsWith("video/"),
      };
    }),
  );
}

export async function blobs(media: readonly PublishMedia[]) {
  return Promise.all(
    media.map(async (item) => {
      const { data, contentType } = await item.load();
      const type = contentType.split(";")[0]!.trim().toLowerCase();
      return { data, contentType: type, video: type.startsWith("video/") };
    }),
  );
}

import type { MediaSource, PublishMedia } from "./types";

export async function openMedia(media: PublishMedia): Promise<MediaSource> {
  if (media.open) return media.open();
  const { data, contentType } = await media.load();
  return {
    stream: new Blob([data]).stream(),
    size: data.byteLength,
    contentType,
  };
}

/** Rechunk without buffering the entire upload; release the reader on every exit. */
export async function* mediaChunks(
  source: MediaSource,
  chunkSize: number | readonly number[],
): AsyncGenerator<Uint8Array<ArrayBuffer>> {
  const reader = source.stream.getReader();
  let part = 0;
  const sizeForPart = () =>
    typeof chunkSize === "number" ? chunkSize : (chunkSize[part] ?? 1);
  let buffer = new Uint8Array(sizeForPart());
  let used = 0;
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > source.size)
        throw new Error("Media stream exceeds its declared size");
      let offset = 0;
      while (offset < value.byteLength) {
        const length = Math.min(
          buffer.byteLength - used,
          value.byteLength - offset,
        );
        buffer.set(value.subarray(offset, offset + length), used);
        used += length;
        offset += length;
        if (used === buffer.byteLength) {
          yield buffer;
          part++;
          buffer = new Uint8Array(sizeForPart());
          used = 0;
        }
      }
    }
    if (total !== source.size)
      throw new Error("Media stream does not match its declared size");
    if (used) yield buffer.slice(0, used);
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function base64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32_768)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32_768));
  return btoa(binary);
}

export async function cancelMedia(
  sources: readonly MediaSource[],
): Promise<void> {
  await Promise.all(
    sources.map((source) => source.stream.cancel().catch(() => {})),
  );
}

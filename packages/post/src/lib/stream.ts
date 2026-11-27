/** Re-cuts a stream into chunks of exactly `size` bytes; only the last one is shorter. */
export async function* chunks(stream: ReadableStream<Uint8Array>, size: number) {
  let buffer = new Uint8Array(size);
  let filled = 0;
  for await (const part of stream) {
    let read = 0;
    while (read < part.byteLength) {
      const take = Math.min(size - filled, part.byteLength - read);
      buffer.set(part.subarray(read, read + take), filled);
      filled += take;
      read += take;
      if (filled === size) {
        yield buffer;
        buffer = new Uint8Array(size);
        filled = 0;
      }
    }
  }
  if (filled > 0) yield buffer.subarray(0, filled);
}

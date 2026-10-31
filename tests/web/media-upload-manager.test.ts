import { expect, mock, test } from "bun:test";

import { MediaUploadManager } from "../../apps/web/src/components/posts/media-upload-manager";

const file = () => new File(["photo"], "photo.jpg", { type: "image/jpeg" });
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
function pending() {
  let resolve!: (key: string) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<string>((ok, fail) => {
    resolve = ok;
    reject = fail;
  });
  return { promise, resolve, reject };
}
test("selection immediately starts an upload, reports real progress and deduplicates shared files", async () => {
  const request = pending();
  const upload = mock(
    (
      _file: File,
      _options: { signal: AbortSignal; onProgress: (percent: number) => void }
    ) => request.promise
  );
  const manager = new MediaUploadManager(
    upload,
    async () => {},
    () => {}
  );
  const photo = file();
  manager.start(photo);
  manager.start(photo);
  expect(upload).toHaveBeenCalledTimes(1);
  expect(manager.get(photo)?.status).toBe("uploading");
  expect(() => manager.keys([photo])).toThrow("Wait for all media uploads");
  upload.mock.calls[0]![1].onProgress(45);
  expect(manager.get(photo)?.progress).toBe(45);
  request.resolve("media/photo");
  await settle();
  expect(manager.get(photo)?.status).toBe("uploaded");
  expect(manager.get(photo)?.progress).toBe(100);
  expect(manager.keys([photo, photo])).toEqual(["media/photo", "media/photo"]);
});
test("failed uploads can be retried and cannot be submitted while failed", async () => {
  const upload = mock(() => Promise.resolve("media/retry"));
  upload.mockRejectedValueOnce(new Error("Connection lost"));
  const manager = new MediaUploadManager(
    upload,
    async () => {},
    () => {}
  );
  const photo = file();
  manager.start(photo);
  await settle();
  expect(manager.get(photo)?.error).toBe("Connection lost");
  expect(() => manager.keys([photo])).toThrow();
  manager.retry(photo);
  await settle();
  expect(upload).toHaveBeenCalledTimes(2);
  expect(manager.keys([photo])).toEqual(["media/retry"]);
});
test("removing completed media deletes the remote file", async () => {
  const remove = mock(async () => {});
  const manager = new MediaUploadManager(
    async () => "media/unused",
    remove,
    () => {}
  );
  const photo = file();
  manager.start(photo);
  await settle();
  manager.release(photo);
  await settle();
  expect(remove).toHaveBeenCalledWith("media/unused");
  expect(manager.get(photo)).toBeUndefined();
});
test("removing in-flight media aborts it and cleans up a late completion", async () => {
  const request = pending();
  const upload = mock(
    (
      _file: File,
      _options: { signal: AbortSignal; onProgress: (percent: number) => void }
    ) => request.promise
  );
  const remove = mock(async () => {});
  const manager = new MediaUploadManager(upload, remove, () => {});
  const photo = file();
  manager.start(photo);
  manager.release(photo);
  expect(upload.mock.calls[0]![1].signal.aborted).toBe(true);
  request.resolve("media/late");
  await settle();
  expect(remove).toHaveBeenCalledWith("media/late");
  expect(manager.get(photo)).toBeUndefined();
});
test("closing the composer removes unused uploads but preserves submitted media", async () => {
  const remove = mock(async () => {});
  const manager = new MediaUploadManager(
    async (file) => `media/${file.name}`,
    remove,
    () => {}
  );
  const used = file(),
    unused = new File(["x"], "unused.jpg");
  manager.start(used);
  manager.start(unused);
  await settle();
  manager.retain([used]);
  manager.dispose();
  await settle();
  expect(remove).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledWith("media/unused.jpg");
});
test("closing while uploading aborts and safely cleans a late response without state updates", async () => {
  const request = pending();
  const changed = mock(() => {}),
    remove = mock(async () => {});
  const manager = new MediaUploadManager(
    () => request.promise,
    remove,
    changed
  );
  manager.start(file());
  const count = changed.mock.calls.length;
  manager.dispose();
  request.resolve("media/closed");
  await settle();
  expect(changed.mock.calls.length).toBe(count);
  expect(remove).toHaveBeenCalledWith("media/closed");
});

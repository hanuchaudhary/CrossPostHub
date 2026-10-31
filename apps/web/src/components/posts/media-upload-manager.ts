export type MediaUploadState = {
  file: File;
  status: "uploading" | "uploaded" | "error";
  progress: number;
  key?: string;
  error?: string;
};
type Entry = MediaUploadState & { controller: AbortController };
type Upload = (
  file: File,
  options: { signal: AbortSignal; onProgress: (percent: number) => void }
) => Promise<string>;

/** Owns uploads for one composer, including media in hidden platform variants. */
export class MediaUploadManager {
  private entries = new Map<File, Entry>();
  private retained = new Set<string>();
  private closed = false;
  private upload: Upload;
  private remove: (key: string) => Promise<unknown>;
  private changed: () => void;
  constructor(
    upload: Upload,
    remove: (key: string) => Promise<unknown>,
    changed: () => void
  ) {
    this.upload = upload;
    this.remove = remove;
    this.changed = changed;
  }
  get(file: File): MediaUploadState | undefined {
    return this.entries.get(file);
  }
  snapshot(): Map<File, MediaUploadState> {
    return new Map(
      [...this.entries].map(([file, entry]) => [file, { ...entry }])
    );
  }
  start(file: File) {
    if (this.closed || this.entries.has(file)) return;
    const entry: Entry = {
      file,
      status: "uploading",
      progress: 0,
      controller: new AbortController(),
    };
    this.entries.set(file, entry);
    this.changed();
    void this.upload(file, {
      signal: entry.controller.signal,
      onProgress: (progress) => {
        if (this.entries.get(file) === entry && !this.closed) {
          entry.progress = progress;
          this.changed();
        }
      },
    })
      .then(async (key) => {
        if (this.closed || this.entries.get(file) !== entry) {
          await this.cleanup(key);
          return;
        }
        entry.key = key;
        entry.progress = 100;
        entry.status = "uploaded";
        this.changed();
      })
      .catch((error: unknown) => {
        if (this.closed || this.entries.get(file) !== entry) return;
        entry.status = "error";
        entry.error =
          error instanceof Error ? error.message : "Upload failed. Try again.";
        this.changed();
      });
  }
  retry(file: File) {
    const entry = this.entries.get(file);
    if (!entry || entry.status !== "error") return;
    this.entries.delete(file);
    this.start(file);
  }
  /** Remove only when no shared or platform-specific draft still uses the file. */
  release(file: File) {
    const entry = this.entries.get(file);
    if (!entry) return;
    this.entries.delete(file);
    entry.controller.abort();
    if (entry.key) void this.cleanup(entry.key);
    if (!this.closed) this.changed();
  }
  keys(files: readonly File[]) {
    return files.map((file) => {
      const entry = this.entries.get(file);
      if (entry?.status !== "uploaded" || !entry.key)
        throw new Error(
          "Wait for all media uploads to finish, or retry failed uploads."
        );
      return entry.key;
    });
  }
  /** Once submitted, a failed response may still represent queued server jobs. */
  retain(files: readonly File[]) {
    this.keys(files).forEach((key) => this.retained.add(key));
  }
  dispose() {
    this.closed = true;
    for (const file of this.entries.keys()) this.release(file);
  }
  private async cleanup(key: string) {
    if (!this.retained.has(key)) await this.remove(key).catch(() => undefined);
  }
}

import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import {
  motion,
  Reorder,
  useDragControls,
  useReducedMotion,
} from "motion/react";

import type { Platform } from "@/lib/types";

import { MediaFile } from "./preview/media";

export const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime";
const megabytes = 1024 * 1024;
export function validateAttachments(
  files: readonly File[]
): string | undefined {
  if (files.length > 4) return "Choose up to 4 photos or one video.";
  for (const file of files) {
    if (!MEDIA_ACCEPT.split(",").includes(file.type))
      return `${file.name}: choose a JPEG, PNG, WebP, GIF, MP4 or MOV file.`;
    const limit = file.type.startsWith("video/")
      ? 200
      : file.type === "image/gif"
        ? 15
        : 10;
    if (!file.size || file.size > limit * megabytes)
      return `${file.name}: the file must be between 1 byte and ${limit} MB.`;
  }
  if (files.length > 1 && files.some((file) => file.type.startsWith("video/")))
    return "Publish a video on its own. Remove the other attachments or customize media per platform.";
}
export function validatePlatformMedia(
  provider: Platform,
  files: readonly File[]
): string | undefined {
  const error = validateAttachments(files);
  if (error) return error;
  if (provider === "instagram") {
    if (!files.length) return "Instagram needs a photo or video.";
    if (
      files.some(
        (file) =>
          !["image/jpeg", "video/mp4", "video/quicktime"].includes(file.type)
      )
    )
      return "Instagram supports JPEG photos and MP4/MOV videos. Choose compatible media or customize this platform.";
    if (
      files.some(
        (file) => file.type === "image/jpeg" && file.size > 8 * megabytes
      )
    )
      return "Instagram photos must be under 8 MB.";
  }
  if (
    provider === "linkedin" &&
    files.some((file) => ["image/webp", "video/quicktime"].includes(file.type))
  )
    return "LinkedIn supports JPEG, PNG, GIF and MP4. Choose compatible media or customize this platform.";
  if (provider === "twitter") {
    if (files.some((file) => file.type === "video/quicktime"))
      return "X videos must be MP4.";
    if (
      files.some(
        (file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
          file.size > 5 * megabytes
      )
    )
      return "X photos must be under 5 MB each.";
    if (files.length > 1 && files.some((file) => file.type === "image/gif"))
      return "X supports a single GIF or up to 4 still photos. Publish the GIF on its own.";
  }
}

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

export function useMediaUploads(
  upload: Upload,
  remove: (key: string) => Promise<unknown>
) {
  const [entries, setEntries] = useState(new Map<File, MediaUploadState>());
  const manager = useRef<MediaUploadManager | null>(null);
  useEffect(() => {
    const uploads = new MediaUploadManager(upload, remove, () =>
      setEntries(uploads.snapshot())
    );
    manager.current = uploads;
    return () => {
      manager.current = null;
      uploads.dispose();
    };
  }, [upload, remove]);
  return {
    entries,
    start: (files: readonly File[]) =>
      files.forEach((file) => manager.current?.start(file)),
    retry: (file: File) => manager.current?.retry(file),
    release: (file: File) => manager.current?.release(file),
    keys: (files: readonly File[]) => {
      if (!files.length) return [];
      if (!manager.current)
        throw new Error("The uploader is not ready. Try again.");
      return manager.current.keys(files);
    },
    retain: (files: readonly File[]) => manager.current?.retain(files),
  };
}

function SortableMedia({
  file,
  enabled,
  sorting,
  instructionsId,
  children,
  onStart,
  onEnd,
}: {
  file: File;
  enabled: boolean;
  sorting: boolean;
  instructionsId: string;
  children: ReactNode;
  onStart: () => void;
  onEnd: (cancelled: boolean) => void;
}) {
  const controls = useDragControls();
  const reduceMotion = useReducedMotion();
  return (
    <Reorder.Item
      as="div"
      value={file}
      drag={enabled}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      layout="position"
      role="group"
      aria-label={`Reorder ${file.name}`}
      aria-describedby={enabled ? instructionsId : undefined}
      tabIndex={enabled ? 0 : -1}
      className={`relative size-32 shrink-0 select-none rounded-xl border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-36 [&_img]:pointer-events-none [&_video]:pointer-events-none ${enabled ? "touch-none cursor-grab active:cursor-grabbing" : ""}`}
      animate={{ scale: sorting && !reduceMotion ? 0.97 : 1 }}
      whileDrag={{
        scale: reduceMotion ? 1 : 1.06,
        boxShadow: "0 16px 32px -8px rgb(0 0 0 / 35%)",
        cursor: "grabbing",
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 26, mass: 0.7 }
      }
      onPointerDown={(event) => {
        if (
          !enabled ||
          event.button !== 0 ||
          (event.target as HTMLElement).closest("button")
        )
          return;
        controls.start(event);
      }}
      onDragStart={onStart}
      onDragEnd={(event) => onEnd(event.type === "pointercancel")}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
        {children}
      </div>
    </Reorder.Item>
  );
}

export function MediaUpload({
  files,
  platforms,
  uploads,
  onChange,
  disabled = false,
}: {
  files: File[];
  platforms: readonly Platform[];
  uploads: ReturnType<typeof useMediaUploads>;
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string>();
  const errorId = useId();
  const instructionsId = useId();
  const [sorting, setSorting] = useState<{ file: File; files: File[] } | null>(
    null
  );
  const sortingRef = useRef<{ file: File; files: File[] } | null>(null);
  const orderedFiles = sorting?.files ?? files;
  function startSorting(file: File) {
    const next = { file, files: [...files] };
    sortingRef.current = next;
    setSorting(next);
  }
  function reorder(next: File[]) {
    const current = sortingRef.current;
    if (current) {
      const updated = { ...current, files: next };
      sortingRef.current = updated;
      setSorting(updated);
    } else if (!disabled) {
      onChange(next);
    }
  }
  function endSorting(cancelled: boolean) {
    const current = sortingRef.current;
    sortingRef.current = null;
    setSorting(null);
    if (current && !cancelled && !disabled) onChange(current.files);
  }
  const issues = platforms.flatMap((platform) => {
    const issue = validatePlatformMedia(platform, files);
    return issue
      ? [
          `${platform === "twitter" ? "X" : platform === "linkedin" ? "LinkedIn" : "Instagram"}: ${issue}`,
        ]
      : [];
  });
  function receive(incoming: File[]) {
    if (disabled || !incoming.length) return;
    const unique = incoming.filter(
      (file, index) =>
        !files.some(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        ) &&
        !incoming
          .slice(0, index)
          .some(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified
          )
    );
    if (!unique.length) return;
    const next = [...files, ...unique];
    const issue =
      validateAttachments(next) ??
      platforms
        .map((platform) => validatePlatformMedia(platform, next))
        .find(Boolean);
    setError(issue);
    if (issue) return;
    onChange(next);
    uploads.start(unique);
  }
  function move(index: number, offset: number) {
    const next = [...files];
    [next[index], next[index + offset]] = [next[index + offset]!, next[index]!];
    onChange(next);
  }
  const actionClass =
    "inline-flex size-6 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40";
  return (
    <div className="space-y-2">
      <p id={instructionsId} className="sr-only">
        Drag media to reorder. With a thumbnail focused, press Space to grab it,
        use arrow keys to move it, then Space to drop or Escape to cancel.
      </p>
      <Reorder.Group
        as="div"
        axis="xy"
        values={orderedFiles}
        onReorder={reorder}
        className="relative flex flex-wrap gap-3"
        aria-label="Post media"
      >
        {orderedFiles.map((file) => {
          const entry = uploads.entries.get(file);
          const status = entry?.status ?? "uploading";
          const progress = Math.max(
            0,
            Math.min(100, Math.round(entry?.progress ?? 0))
          );
          return (
            <SortableMedia
              key={`${file.name}-${file.size}-${file.lastModified}`}
              file={file}
              enabled={!disabled && files.length > 1}
              sorting={sorting !== null && sorting.file !== file}
              instructionsId={instructionsId}
              onStart={() => startSorting(file)}
              onEnd={endSorting}
            >
              <MediaFile
                file={file}
                controls={false}
                className="h-full w-full group transition-all duration-300"
              />
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                className={`${actionClass} absolute top-1.5 right-1.5 z-10 hidden transition-all duration-300 group-hover:block`}
                onClick={() => {
                  setError(undefined);
                  onChange(files.filter((item) => item !== file));
                }}
              >
                <X className="size-3.5" />
              </button>
              {status === "uploading" && (
                <div
                  className="absolute bottom-1 -translate-x-1/2 left-1/2 w-full flex flex-col items-center justify-center gap-2 h-full bg-black/55 px-3 text-white"
                  role="progressbar"
                  aria-label={`Uploading ${file.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-valuetext={
                    progress === 100
                      ? "Processing upload"
                      : `${progress}% uploaded`
                  }
                >
                  <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
                  <span className="text-xs font-medium">
                    {progress === 100 ? "Processing…" : `${progress}%`}
                  </span>
                  <progress
                    value={progress}
                    max={100}
                    className="h-1 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-white [&::-webkit-progress-bar]:bg-white/25 [&::-webkit-progress-value]:bg-white"
                  />
                </div>
              )}
              {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 px-3 text-center text-white">
                  <span
                    role="alert"
                    className="line-clamp-3 text-[10px] leading-4"
                    title={entry?.error}
                  >
                    {entry?.error ?? "Upload failed"}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Retry ${file.name}`}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-black focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                    onClick={() => uploads.retry(file)}
                  >
                    <RotateCcw className="size-3" /> Retry
                  </button>
                </div>
              )}
            </SortableMedia>
          );
        })}
        <motion.button
          layout="position"
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 26,
            mass: 0.7,
          }}
          type="button"
          disabled={disabled}
          aria-label="Add photos or video"
          aria-describedby={error || issues.length ? errorId : undefined}
          className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 sm:min-h-36 ${files.length ? "size-32 shrink-0 sm:size-36" : "w-full"} ${over ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-muted"}`}
          onClick={() => input.current?.click()}
          onDragEnter={(event) => {
            if (!Array.from(event.dataTransfer.types).includes("Files")) return;
            event.preventDefault();
            if (!disabled) {
              depth.current++;
              setOver(true);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = disabled ? "none" : "copy";
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            depth.current = Math.max(0, depth.current - 1);
            if (!depth.current) setOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            depth.current = 0;
            setOver(false);
            receive(Array.from(event.dataTransfer.files));
          }}
        >
          <Upload className="size-5" />
          <span className="text-xs font-medium">
            {over
              ? "Drop to upload"
              : files.length
                ? "Add media"
                : "Drop media here or select files"}
          </span>
          {!files.length && (
            <span className="text-[10px]">Up to 4 photos or one video</span>
          )}
        </motion.button>
      </Reorder.Group>
      <input
        ref={input}
        type="file"
        multiple
        accept={MEDIA_ACCEPT}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-label="Select photos or video"
        onChange={(event) => {
          receive(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      {(error || issues.length > 0) && (
        <div
          id={errorId}
          role="alert"
          className="space-y-1 text-xs leading-5 text-destructive"
        >
          {error && <p>{error}</p>}
          {issues.map((issue) => (
            <p key={issue}>{issue}</p>
          ))}
        </div>
      )}
      <span role="status" className="sr-only">
        {
          files.filter(
            (file) => uploads.entries.get(file)?.status === "uploading"
          ).length
        }{" "}
        files uploading
      </span>
    </div>
  );
}

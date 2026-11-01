import { useEffect, useRef, useState } from "react";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MediaFile({
  file,
  className,
  controls = true,
}: {
  file: File;
  className?: string;
  controls?: boolean;
}) {
  const media = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const element = media.current;
    if (element) element.src = url;
    return () => {
      if (element instanceof HTMLVideoElement) {
        element.pause();
        element.removeAttribute("src");
        element.load();
      }
      URL.revokeObjectURL(url);
    };
  }, [file]);
  return (
    <div className={cn("relative overflow-hidden bg-black/5", className)}>
      {file.type.startsWith("video/") ? (
        <video
          ref={media as React.RefObject<HTMLVideoElement>}
          controls={controls}
          playsInline
          preload="metadata"
          aria-label={file.name}
          className="h-full max-h-[500px] w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          ref={media as React.RefObject<HTMLImageElement>}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      )}
      {failed && (
        <p
          role="status"
          className="absolute inset-x-0 top-1/2 bg-black/75 p-3 text-center text-xs text-white"
        >
          This browser cannot preview this video format. Try an MP4 video.
        </p>
      )}
    </div>
  );
}
export function PreviewMedia({
  files,
  platform,
}: {
  files: File[];
  platform: Platform;
}) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState<File | null>(null);
  const touchStart = useRef<number | null>(null);
  if (!files.length) return null;
  const current = Math.min(index, files.length - 1);
  const carousel = platform === "instagram";
  const video = files[0]!.type.startsWith("video/");
  return (
    <>
      {carousel ? (
        <div>
          <div
            className="relative bg-neutral-100 dark:bg-neutral-900"
            role={files.length > 1 ? "region" : undefined}
            aria-label={files.length > 1 ? "Post photo carousel" : undefined}
            tabIndex={files.length > 1 ? 0 : undefined}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                setIndex(Math.max(0, current - 1));
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                setIndex(Math.min(files.length - 1, current + 1));
              }
            }}
            onTouchStart={(event) => {
              touchStart.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current;
              const end = event.changedTouches[0]?.clientX;
              touchStart.current = null;
              if (
                start === null ||
                end === undefined ||
                Math.abs(start - end) < 40
              )
                return;
              setIndex(
                Math.min(
                  files.length - 1,
                  Math.max(0, current + (start > end ? 1 : -1))
                )
              );
            }}
          >
            <MediaFile
              key={`${files[current]!.name}-${files[current]!.lastModified}`}
              file={files[current]!}
              className="aspect-square"
            />
            {files.length > 1 && (
              <>
                <span className="absolute top-3 right-3 rounded-full bg-black/65 px-2 py-1 text-[10px] text-white">
                  {current + 1}/{files.length}
                </span>
                {current > 0 && (
                  <button
                    type="button"
                    aria-label="Previous photo"
                    className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-black shadow"
                    onClick={() => setIndex(current - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                {current < files.length - 1 && (
                  <button
                    type="button"
                    aria-label="Next photo"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-black shadow"
                    onClick={() => setIndex(current + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </>
            )}
          </div>
          {files.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-3">
              {files.map((file, i) => (
                <button
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={i === current}
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className={`size-1.5 rounded-full ${i === current ? "bg-[#0095f6]" : "bg-neutral-300 dark:bg-neutral-600"}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      ) : video ? (
        <MediaFile file={files[0]!} className="min-h-40" />
      ) : (
        <div
          className={cn(
            "grid gap-0.5 overflow-hidden",
            files.length === 1 ? "grid-cols-1" : "aspect-[4/3] grid-cols-2",
            platform === "linkedin" &&
              files.length === 4 &&
              "grid-cols-3 grid-rows-[2fr_1fr]",
            platform === "twitter" && files.length >= 3 && "grid-rows-2"
          )}
        >
          {files.map((file, i) => (
            <button
              type="button"
              key={`${file.name}-${file.size}-${file.lastModified}`}
              aria-label={`Enlarge photo ${i + 1}: ${file.name}`}
              className={cn(
                "min-h-0 min-w-0 overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500",
                files.length === 1 && "max-h-[440px]",
                files.length === 3 &&
                  i === 0 &&
                  (platform === "twitter" ? "row-span-2" : "col-span-2"),
                platform === "linkedin" &&
                  files.length === 4 &&
                  i === 0 &&
                  "col-span-3"
              )}
              onClick={() => setExpanded(file)}
            >
              <MediaFile
                file={file}
                className={cn(
                  "h-full w-full",
                  files.length === 1 &&
                    "[&_img]:max-h-[440px] [&_img]:object-contain"
                )}
              />
            </button>
          ))}
        </div>
      )}
      <Dialog.Root
        open={!!expanded}
        onOpenChange={(open) => {
          if (!open) setExpanded(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[70] bg-black/85" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-[70] w-[min(900px,94vw)] -translate-x-1/2 -translate-y-1/2 outline-none">
            <Dialog.Title className="sr-only">Photo preview</Dialog.Title>
            <Dialog.Description className="sr-only">
              Full size preview of your attached photo.
            </Dialog.Description>
            {expanded && (
              <MediaFile
                file={expanded}
                className="max-h-[85dvh] [&_img]:max-h-[85dvh] [&_img]:object-contain"
              />
            )}
            <Dialog.Close
              aria-label="Close photo preview"
              className="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-white"
            >
              <X size={18} />
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

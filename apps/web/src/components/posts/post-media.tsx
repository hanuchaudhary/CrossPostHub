import { useState } from "react";

import { cn } from "cn";

import { Icon } from "@/components/ui/icon";
import { isVideoKey, mediaUrl } from "@/lib/api";
import type { Post } from "@/lib/types";

/** One uploaded image or video, cropped to fill its box. */
export function MediaThumb({
  mediaKey,
  className,
}: {
  mediaKey: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const video = isVideoKey(mediaKey);
  return (
    <span
      className={cn(
        "relative block overflow-hidden bg-secondary ring-1 ring-border",
        className
      )}
    >
      {broken ? (
        <span className="grid size-full place-items-center text-muted-foreground">
          <Icon name="image" size={16} />
        </span>
      ) : video ? (
        <video
          src={`${mediaUrl(mediaKey)}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      ) : (
        <img
          src={mediaUrl(mediaKey)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      )}
      {video && !broken && (
        <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-sm">
          Video
        </span>
      )}
    </span>
  );
}

/** Square leading visual for a post: its first media, or the platform icon. */
export function PostVisual({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  const [first] = post.mediaKeys;
  if (!first)
    return (
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-xl bg-secondary",
          className
        )}
      >
        <Icon name={post.provider} size={22} />
      </span>
    );
  return (
    <span className={cn("relative size-14 shrink-0", className)}>
      <MediaThumb mediaKey={first} className="size-full rounded-xl" />
      <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-md bg-background ring-1 ring-border">
        <Icon name={post.provider} size={12} />
      </span>
      {post.mediaKeys.length > 1 && (
        <span className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 text-[10px] leading-4 text-white tabular-nums backdrop-blur-sm">
          +{post.mediaKeys.length - 1}
        </span>
      )}
    </span>
  );
}

/** Up to four media tiles for a post card. */
export function MediaGrid({ keys }: { keys: string[] }) {
  if (!keys.length) return null;
  const shown = keys.slice(0, 4);
  return (
    <div
      className={cn(
        "grid gap-1.5",
        shown.length === 1 ? "max-w-sm grid-cols-1" : "max-w-md grid-cols-2"
      )}
    >
      {shown.map((key, index) => (
        <span key={key} className="relative">
          <MediaThumb
            mediaKey={key}
            className={cn(
              "rounded-xl",
              shown.length === 1 ? "aspect-video" : "aspect-square"
            )}
          />
          {index === 3 && keys.length > 4 && (
            <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/50 text-sm text-white tabular-nums">
              +{keys.length - 4}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

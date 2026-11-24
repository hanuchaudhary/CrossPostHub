import {
  Bookmark,
  ChartNoAxesColumn,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
} from "lucide-react";

import { type PostPreviewProps, PreviewAvatar, PreviewCaption } from "./common";
import { PreviewMedia } from "./media";

export function TwitterPreview({ author, text, files }: PostPreviewProps) {
  const handle =
    author.name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 15) || "yourhandle";
  return (
    <article
      aria-label="X post preview"
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 font-[Arial,sans-serif] text-[#0f1419] dark:border-neutral-800 dark:bg-black dark:text-[#e7e9ea]"
    >
      <div className="flex gap-2.5">
        <PreviewAvatar author={author} />
        <div className="min-w-0 flex-1">
          <header className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold">{author.name}</p>
              <p className="truncate text-[11px] text-[#536471] dark:text-[#71767b]">
                @{handle} · now
              </p>
            </div>
            <MoreHorizontal size={18} className="shrink-0 text-neutral-500" />
          </header>
          {text && (
            <PreviewCaption
              text={text}
              limit={280}
              className="mb-3 text-[14px] [&_span]:text-[#1d9bf0]"
            />
          )}
          {!text && !files.length && (
            <p className="pb-6 text-xs text-neutral-400">What’s happening?</p>
          )}
          <div className="overflow-hidden rounded-xl">
            <PreviewMedia files={files} platform="twitter" />
          </div>
          <footer
            aria-hidden="true"
            className="mt-3 flex items-center justify-between gap-2 text-[#536471] dark:text-[#71767b]"
          >
            <MessageCircle size={16} />
            <Repeat2 size={17} />
            <Heart size={16} />
            <ChartNoAxesColumn size={16} />
            <Bookmark size={16} />
            <Share size={16} />
          </footer>
        </div>
      </div>
    </article>
  );
}

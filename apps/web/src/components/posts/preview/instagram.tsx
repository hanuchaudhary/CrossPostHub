import {
  Bookmark,
  Heart,
  Image,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";

import { type PostPreviewProps, PreviewAvatar, PreviewCaption } from "./common";
import { PreviewMedia } from "./media";

export function InstagramPreview({ author, text, files }: PostPreviewProps) {
  const handle =
    author.name.toLowerCase().replace(/[^a-z0-9_.]/g, "") || "yourhandle";
  return (
    <article
      aria-label="Instagram post preview"
      className="overflow-hidden rounded-lg border border-neutral-200 bg-white font-[Arial,sans-serif] text-neutral-950 dark:border-neutral-800 dark:bg-black dark:text-neutral-50"
    >
      <header className="flex items-center gap-2.5 px-3 py-3">
        <div className="rounded-full bg-gradient-to-tr from-[#ffdc80] via-[#fd1d1d] to-[#833ab4] p-[2px]">
          <PreviewAvatar
            author={author}
            className="size-8 border-2 border-white dark:border-black"
          />
        </div>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold">
          {handle}
        </p>
        <MoreHorizontal size={19} />
      </header>
      {files.length ? (
        <PreviewMedia files={files} platform="instagram" />
      ) : (
        <div className="flex aspect-square flex-col items-center justify-center gap-3 bg-neutral-100 text-neutral-400 dark:bg-neutral-900">
          <Image size={32} strokeWidth={1.5} />
          <span className="text-xs">Add a photo or video</span>
        </div>
      )}
      <footer className="px-3 pb-3">
        <div aria-hidden="true" className="flex items-center gap-3 py-3">
          <Heart size={23} />
          <MessageCircle size={23} />
          <Send size={22} />
          <Bookmark size={23} className="ml-auto" />
        </div>
        {text && (
          <div>
            <span className="mr-1.5 text-xs font-semibold">{handle}</span>
            <PreviewCaption
              text={text}
              limit={125}
              className="inline text-xs [&>div]:inline"
            />
          </div>
        )}
        <p className="mt-2 text-[9px] uppercase tracking-wide text-neutral-500">
          Just now
        </p>
      </footer>
    </article>
  );
}

import {
  Globe2,
  MessageSquare,
  MoreHorizontal,
  Repeat2,
  Send,
  ThumbsUp,
} from "lucide-react";

import {
  type PostPreviewProps,
  PreviewAction,
  PreviewAvatar,
  PreviewCaption,
} from "./common";
import { PreviewMedia } from "./media";

export function LinkedInPreview({ author, text, files }: PostPreviewProps) {
  return (
    <article
      aria-label="LinkedIn post preview"
      className="overflow-hidden rounded-lg border border-neutral-300 bg-white font-[Arial,sans-serif] text-[#191919] shadow-sm dark:border-neutral-700 dark:bg-[#1b1f23] dark:text-[#ffffffeb]"
    >
      <header className="flex items-start gap-2.5 p-3">
        <PreviewAvatar author={author} className="size-11" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-5">
            {author.name}
          </p>
          <p className="text-[10px] leading-4 text-neutral-500 dark:text-neutral-400">
            Your profile
          </p>
          <p className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
            Just now · <Globe2 size={10} />
          </p>
        </div>
        <MoreHorizontal size={20} className="text-neutral-500" />
      </header>
      {text && <PreviewCaption text={text} className="px-3 pb-3" />}
      {!text && !files.length && (
        <p className="px-3 pb-6 text-xs text-neutral-400">
          Your next idea goes here…
        </p>
      )}
      <PreviewMedia files={files} platform="linkedin" />
      <footer className="mx-3 grid grid-cols-4 gap-2 border-t border-neutral-200 py-3 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
        <PreviewAction icon={<ThumbsUp size={17} />}>Like</PreviewAction>
        <PreviewAction icon={<MessageSquare size={17} />}>
          Comment
        </PreviewAction>
        <PreviewAction icon={<Repeat2 size={17} />}>Repost</PreviewAction>
        <PreviewAction icon={<Send size={17} />}>Send</PreviewAction>
      </footer>
    </article>
  );
}

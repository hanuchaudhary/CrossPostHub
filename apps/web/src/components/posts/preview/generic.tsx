import { Heart, MessageCircle, MoreHorizontal, Repeat2, Share } from "lucide-react";

import { PLATFORM_RULES } from "@repo/shared/platforms";

import { getChannel } from "@/lib/constants";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  type PostPreviewProps,
  PreviewAction,
  PreviewAvatar,
  PreviewCaption,
} from "./common";
import { PreviewMedia } from "./media";

export function GenericPreview({
  platform,
  author,
  text,
  files,
}: PostPreviewProps & { platform: Platform }) {
  const channel = getChannel(platform);
  const name = PLATFORM_RULES[platform].name;
  return (
    <article
      aria-label={`${name} post preview`}
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
    >
      <header className="flex items-center gap-2.5 p-3">
        <PreviewAvatar author={author} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{author.name}</p>
          <p className="flex items-center gap-1 text-[10px] text-neutral-500">
            {channel && (
              <img
                src={channel.icon}
                alt=""
                className={cn("size-3", channel.iconClassName)}
              />
            )}
            {name} · Just now
          </p>
        </div>
        <MoreHorizontal size={18} className="text-neutral-500" />
      </header>
      {text && <PreviewCaption text={text} className="px-3 pb-3" />}
      {!text && !files.length && (
        <p className="px-3 pb-6 text-xs text-neutral-400">
          Your next idea goes here…
        </p>
      )}
      <PreviewMedia files={files} platform={platform} />
      <footer className="grid grid-cols-4 gap-2 border-t border-neutral-200 px-3 py-3 text-neutral-500 dark:border-neutral-800">
        <PreviewAction icon={<MessageCircle size={16} />} />
        <PreviewAction icon={<Repeat2 size={16} />} />
        <PreviewAction icon={<Heart size={16} />} />
        <PreviewAction icon={<Share size={16} />} />
      </footer>
    </article>
  );
}

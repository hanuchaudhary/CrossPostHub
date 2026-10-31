import { type ReactNode, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type PostPreviewProps = {
  text: string;
  files: File[];
  author: { name: string; image?: string | null };
};
export function PreviewAvatar({
  author,
  className,
}: {
  author: PostPreviewProps["author"];
  className?: string;
}) {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarImage src={author.image || undefined} />
      <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}
export function PreviewCaption({
  text,
  limit = 230,
  className,
}: {
  text: string;
  limit?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = !expanded && text.length > limit;
  const caption = truncated ? text.slice(0, limit) : text;
  return (
    <div
      className={cn(
        "whitespace-pre-wrap break-words text-[13px] leading-[1.5] [overflow-wrap:anywhere]",
        className
      )}
    >
      {caption
        .split(/((?:https?:\/\/\S+)|(?:[#@][\p{L}\p{N}_]+))/gu)
        .map((part, i) =>
          /^[#@]|^https?:/.test(part) ? (
            <span key={i} className="text-[#0a66c2] dark:text-[#71b7fb]">
              {part}
            </span>
          ) : (
            part
          )
        )}
      {truncated && (
        <button
          type="button"
          className="text-neutral-500 hover:underline"
          onClick={() => setExpanded(true)}
        >
          … more
        </button>
      )}
    </div>
  );
}
export function PreviewAction({
  icon,
  children,
}: {
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <span className="flex items-center justify-center gap-1.5 text-[10px] font-medium">
      {icon}
      {children}
    </span>
  );
}

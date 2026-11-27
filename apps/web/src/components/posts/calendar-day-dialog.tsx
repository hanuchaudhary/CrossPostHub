import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { PostRow } from "@/components/workspace/common";
import type { Post } from "@/lib/types";

/** Everything planned or posted on one calendar day. */
export function CalendarDayDialog({
  day,
  posts,
  canSchedule,
  onSchedule,
  onOpenChange,
}: {
  day: Date | null;
  posts: Post[];
  canSchedule: boolean;
  onSchedule: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!day} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-2xl p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            {day?.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {posts.length
              ? `${posts.length} post${posts.length === 1 ? "" : "s"} on this day.`
              : "Nothing planned yet."}
          </DialogDescription>
        </DialogHeader>
        {posts.length > 0 && (
          <ul className="-mx-1.5 max-h-[55vh] space-y-1 overflow-y-auto">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </ul>
        )}
        {canSchedule && (
          <Button variant="primary" className="w-full" onClick={onSchedule}>
            <Icon name="plus" />
            Schedule a post
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

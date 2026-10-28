import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage, markNotificationsRead } from "@/lib/api";
import { queries, queryClient, queryKeys, mutationKeys } from "@/lib/query";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { PageHeading, QueryState } from "@/components/workspace/common";

export default function NotificationsPage() {
  const notices = useQuery(queries.notifications());
  const mark = useMutation({
    mutationKey: mutationKeys.notificationsRead,
    mutationFn: markNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <>
      <PageHeading
        title="You’re in the loop."
        description="The latest from your creative corner."
      >
        <Button
          variant="outline"
          disabled={mark.isPending || !notices.data?.some((n) => !n.read)}
          onClick={() => mark.mutate()}
        >
          Mark all as read
        </Button>
      </PageHeading>
      <QueryState
        pending={notices.isPending}
        error={notices.error}
        retry={() => notices.refetch()}
      />
      {notices.isSuccess && (
        <section className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            {notices.data.length ? (
              <div className="divide-y">
                {notices.data.map((notice) => (
                  <div className="flex items-start gap-3 py-4" key={notice.id}>
                    <div className="rounded-lg border p-2">
                      <Icon name="bell" size={17} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium">{notice.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(notice.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notice.read && <Badge variant="secondary">Unread</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon name="bell" />
                  </EmptyMedia>
                  <EmptyTitle>All quiet in your corner.</EmptyTitle>
                  <EmptyDescription>
                    Your post updates will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </section>
      )}
    </>
  );
}

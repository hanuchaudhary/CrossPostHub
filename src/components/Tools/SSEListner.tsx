"use client";
import { toast } from "@/hooks/use-toast";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore";
import { useEffect } from "react";

export default function SSEListener({ userId }: { userId: string }) {
  const { fetchNotifications } = useNotificationStore();
  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(`/api/sse?userId=${userId}`);

    eventSource.onmessage = (event) => {
      try {
        const { type, message } = JSON.parse(event.data);

        switch (type) {
          case "post-success":
            fetchNotifications();
            toast({
              title: "Post published successfully",
              description: message,
            });
            break;
          case "post-failed":
            fetchNotifications();
            toast({
              title: "Post failed",
              description: message,
            });
            break;
          case "connected":
            console.log("SSE connected to server");
            break;
        }
      } catch (error) {
        console.error("SSE parse error:", error);
      }
    };

    return () => eventSource.close();
  }, [userId,fetchNotifications]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore";
import { toast } from "@/hooks/use-toast";

export default function SSEListener({ userId }: { userId: string }) {
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    const eventSource = new EventSource(`/api/sse?userId=${userId}`);

    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data);
      console.log("New notification:", data);
      toast({
        title: "Post Update",
        description: `${data.message}`,
        variant: "default",
      });
      // Fetch notifications to update the UI
      fetchNotifications();
    });

    eventSource.addEventListener("connected", (event) => {
      console.log("SSE connected:", event.data);
    });

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId, fetchNotifications]);

  return null;
}

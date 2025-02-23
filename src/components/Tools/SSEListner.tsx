"use client"; // Mark as a Client Component

import { useEffect } from "react";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore"; 

export default function SSEListener({ userId }: { userId: string }) {
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    // Create an EventSource connection to the SSE endpoint
    const eventSource = new EventSource(`/api/sse?userId=${userId}`);

    // Listen for "notification" events
    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data);
      console.log("New notification:", data);

      // Fetch notifications to update the UI
      fetchNotifications();
    });

    // Listen for "connected" events
    eventSource.addEventListener("connected", (event) => {
      console.log("SSE connection established");
    });

    // Handle errors
    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    // Clean up on component unmount
    return () => {
      eventSource.close();
    };
  }, [userId, fetchNotifications]);

  return null; // This component doesn't render anything
}

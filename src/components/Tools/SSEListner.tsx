"use client"; // Mark as a Client Component

import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function SSEListener({ userId }: { userId: string }) {
  useEffect(() => {
    const eventSource = new EventSource(`/api/sse?userId=${userId}`);

    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data);
      console.log("New notification:", data);

      // Display toast notification
      toast({
        title: data.title,
        description: data.message,
      })
    });

    eventSource.addEventListener("connected", (event) => {
      console.log("SSE connection established");
    });

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  return null; // This component doesn't render anything
}

import { NextResponse } from "next/server";
import prisma from "@/config/prismaConfig";

export async function GET(request: Request) {
  // Create a stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const userId = new URL(request.url).searchParams.get("userId");

      if (!userId) {
        controller.enqueue(
          `data: ${JSON.stringify({ error: "User ID is required" })}\n\n`
        );
        controller.close();
        return;
      }

      // Send initial event to establish connection
      controller.enqueue(`event: connected\n`);
      controller.enqueue(
        `data: ${JSON.stringify({ message: "SSE connection established" })}\n\n`
      );

      // Function to send notifications to the client
      const sendNotification = (notification: any) => {
        controller.enqueue(`event: notification\n`);
        controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`);
      };

      // Simulate sending notifications (replace with real-time logic)
      const notifications = await prisma.notification.findMany({
        where: { userId: userId, read: false },
        orderBy: { createdAt: "desc" },
      });

      notifications.forEach((notification) => {
        sendNotification(notification);
      });

      // Clean up on client disconnect
      request.signal.onabort = () => {
        console.log("Client disconnected");
        controller.close();
      };
    },
  });

  // Return the stream as the response
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

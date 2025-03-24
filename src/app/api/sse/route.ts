import { NextRequest } from "next/server";

// Track connected clients
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return new Response("User ID required", { status: 400 });

  const stream = new ReadableStream({
    start(controller) {
      // Store client connection
      clients.set(userId, controller);

      // Send initial connection message
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({
            type: "connected",
            message: "SSE ready",
          })}\n\n`
        )
      );

      // Cleanup on disconnect
      request.signal.onabort = () => {
        clients.delete(userId);
        controller.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Helper to send messages to specific user
export function sendSSEMessage(userId: string, data: object) {
  const controller = clients.get(userId);
  if (controller) {
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  }
}

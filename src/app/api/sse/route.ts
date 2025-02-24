import { NextResponse } from "next/server";

// In-memory store for SSE clients
const clients = new Map<string, ReadableStreamDefaultController>();

export async function POST(request: Request) {
  const { userId, notification } = await request.json();

  // Get the client's controller
  const controller = clients.get(userId);

  if (controller) {
    // Send the notification to the client
    controller.enqueue(`event: notification\n`);
    controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`);
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this client
      clients.set(userId, controller);

      // Send initial event to establish connection
      controller.enqueue(`event: connected\n`);
      controller.enqueue(
        `data: ${JSON.stringify({ message: "SSE connection established" })}\n\n`
      );

      // Clean up on client disconnect
      request.signal.onabort = () => {
        clients.delete(userId);
        controller.close();
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

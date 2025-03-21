import { NextResponse } from "next/server";

// In-memory store for SSE clients
const clients = new Map<string, ReadableStreamDefaultController>();

export async function POST(request: Request) {
  const { userId, notification } = await request.json();

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

  return NextResponse.json({ success: true });
}

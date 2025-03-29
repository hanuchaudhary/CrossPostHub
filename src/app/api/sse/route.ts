import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { addSSEConnection, removeSSEConnection } from "@/utils/Notifications/SSE/sse";

export async function GET(req: NextRequest) {
  // Extract userId from query parameters
  const userId = req.nextUrl.searchParams.get("userId");

  // Authenticate the user
  const session = await getServerSession(authOptions)

  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Add the connection to the store
  addSSEConnection(userId, { readable, writable });

  // Set SSE headers
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable buffering in Vercel/Nginx
  };

  // Send a "connected" event to confirm the connection
  await writer.write(
    `data: ${JSON.stringify({ type: "connected", message: "SSE connected to server" })}\n\n`
  );

  // Send periodic heartbeat to keep the connection alive
  const heartbeatInterval = setInterval(async () => {
    await writer.write(
      `data: ${JSON.stringify({ type: "heartbeat", message: "Connection alive" })}\n\n`
    );
  }, 30000); // Every 30 seconds

  // Handle client disconnection
  req.signal.addEventListener("abort", () => {
    removeSSEConnection(userId, { readable, writable });
    clearInterval(heartbeatInterval);
    writer.close();
  });

  // Return the readable stream as the response
  return new NextResponse(readable, { headers });
}

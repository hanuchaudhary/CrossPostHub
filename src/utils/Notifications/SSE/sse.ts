// In-memory store for SSE connections
// Map userId to a list of TransformStream controllers
const sseConnections: { [userId: string]: TransformStream[] } = {};

// Utility function to send SSE messages to a user
export async function sendSSEMessage(
  userId: string,
  event: { type: string; message: string }
) {
  if (sseConnections[userId]) {
    for (const conn of sseConnections[userId]) {
      const writer = conn.writable.getWriter();
      await writer.write(`data: ${JSON.stringify(event)}\n\n`);
      writer.releaseLock();
    }
  }
}

// Utility function to add a connection to the store
export function addSSEConnection(userId: string, stream: TransformStream) {
  if (!sseConnections[userId]) {
    sseConnections[userId] = [];
  }
  sseConnections[userId].push(stream);
}

// Utility function to remove a connection from the store
export function removeSSEConnection(userId: string, stream: TransformStream) {
  if (sseConnections[userId]) {
    sseConnections[userId] = sseConnections[userId].filter(
      (conn) => conn.writable !== stream.writable
    );
    if (sseConnections[userId].length === 0) {
      delete sseConnections[userId];
    }
  }
}

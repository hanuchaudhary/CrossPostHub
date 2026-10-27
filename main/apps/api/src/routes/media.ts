import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { requireUser, type AppEnv } from "./shared";
import type { Bindings } from "../types";

const app = new Hono<AppEnv>();

app.put(
  "/upload",
  bodyLimit({ maxSize: 200 * 1024 * 1024 }),
  async (c) => {
    const user = await requireUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const key = c.req.query("key");
    if (!key?.startsWith(`media/${user.id}/`)) {
      return c.json({ error: "Invalid media key" }, 400);
    }

    const contentLength = Number(c.req.header("content-length") ?? 0);
    if (contentLength > 200 * 1024 * 1024) {
      return c.json({ error: "File size exceeds 200 MB limit" }, 413);
    }

    await c.env.MEDIA_BUCKET.put(key, c.req.raw.body, {
      httpMetadata: {
        contentType:
          c.req.query("contentType") ||
          c.req.header("content-type") ||
          "application/octet-stream",
      },
    });

    return c.json({ success: true, key });
  },
);

export default app;

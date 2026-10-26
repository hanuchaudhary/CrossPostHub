import { Hono } from "hono";
import { createAuth } from "./lib/auth";
import { getDb } from "./lib/db";
import { consumePosts } from "./queue";
import { routes } from "./routes";
import type { Bindings, PostJob } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  if (origin === c.env.CLIENT_URL) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Vary", "Origin");
  }
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (c.req.method === "OPTIONS") return c.body(null, 204);
  await next();
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.on(["GET", "POST", "PUT", "PATCH", "DELETE"], "/api/auth/*", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  return createAuth(c.env, db).handler(c.req.raw);
});

app.get("/media/*", async (c) => {
  const key = c.req.path.replace(/^\/media\//, "");
  const object = await c.env.MEDIA_BUCKET.get(key);
  if (!object) return c.json({ error: "Not found" }, 404);
  object.writeHttpMetadata(c.res.headers);
  c.header("etag", object.httpEtag);
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  return c.body(object.body);
});

app.route("/api", routes);

export default {
  fetch: app.fetch,
  queue(batch: MessageBatch<PostJob>, env: Bindings) {
    return consumePosts(batch, env);
  },
};

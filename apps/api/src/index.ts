import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { createAuth } from "./lib/auth";
import { consumePosts } from "./queue";
import type { Bindings, PostJob } from "./types";
import { apiCors } from "./middleware/cors";
import { handleError, handleNotFound } from "./middleware/error-handler";
import notifications from "./routes/notifications";
import payment from "./routes/payment";
import posts from "./routes/posts";
import media from "./routes/media";
import user from "./routes/user";
import {
  prismaMiddleware,
  sessionMiddleware,
  type AppEnv,
} from "./routes/shared";

const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", secureHeaders());
app.use("/api/*", apiCors);

app.onError(handleError);
app.notFound(handleNotFound);

app.get("/health", (c) => c.json({ status: "ok" }));

app.use("/api/*", prismaMiddleware);
app.use("/api/*", sessionMiddleware);

app.all("/api/auth/*", async (c) => {
  return createAuth(c.env, c.get("prisma")).handler(c.req.raw);
});

app.route("/api/notifications", notifications);
app.route("/api/payment", payment);
app.route("/api/post", posts);
app.route("/api/media", media);
app.route("/api", user);

export default {
  fetch: app.fetch,
  queue(batch: MessageBatch<PostJob>, env: Bindings) {
    return consumePosts(batch, env);
  },
};

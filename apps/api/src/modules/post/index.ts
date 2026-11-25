import { Hono } from "hono";
import { z } from "zod";
import { dbFor, requireUser, type AppEnv } from "../../routes/shared";
import { isProviderId } from "./providers";
import { HttpError, PostService } from "./service";

const signedRequestBody = z.object({ signed_request: z.string() });

async function signedRequest(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  const body = type.includes("application/json")
    ? await request.json()
    : Object.fromEntries(await request.formData());
  return signedRequestBody.parse(body).signed_request;
}

export const post = new Hono<AppEnv>();

post.onError((error, c) => {
  if (error instanceof HttpError)
    return c.json({ message: error.message }, error.status);
  throw error;
});

post.get("/connections", async (c) => {
  const user = requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  return c.json(await PostService.connections(dbFor(c), user.id));
});

post.get("/access", async (c) => {
  const user = requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  return c.json(await PostService.access(dbFor(c), user.id));
});

post.delete("/connections/:id", async (c) => {
  const user = requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  return c.json(
    await PostService.disconnect(dbFor(c), c.env, user.id, c.req.param("id")),
  );
});

post.post("/instagram/deauthorize", async (c) =>
  c.json(
    await PostService.instagramDeauthorize(
      dbFor(c),
      c.env,
      await signedRequest(c.req.raw),
    ),
  ),
);

post.post("/instagram/data-deletion", async (c) =>
  c.json(
    await PostService.instagramDataDeletion(
      dbFor(c),
      c.env,
      await signedRequest(c.req.raw),
    ),
  ),
);

post.post("/:provider/connect", async (c) => {
  const user = requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const provider = c.req.param("provider");
  if (!isProviderId(provider))
    return c.json({ message: `Posting to ${provider} is not available yet` }, 400);
  return c.json(
    await PostService.connectUrl(dbFor(c), c.env, user.id, provider),
  );
});

post.get("/:provider/callback", async (c) => {
  const provider = c.req.param("provider");
  if (!isProviderId(provider)) return c.json({ message: "Not found" }, 404);
  return c.redirect(
    await PostService.callback(
      dbFor(c),
      c.env,
      provider,
      c.req.query(),
      requireUser(c)?.id ?? null,
    ),
  );
});

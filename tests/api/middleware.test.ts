import { expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { apiCors } from "../../apps/api/src/middleware/cors";
import {
  handleError,
  handleNotFound,
} from "../../apps/api/src/middleware/error-handler";
import {
  prismaMiddleware,
  sessionMiddleware,
  requireUser,
  type AppEnv,
} from "../../apps/api/src/routes/shared";
import * as auth from "../../apps/api/src/lib/auth";
import * as databaseModule from "../../apps/api/src/lib/db";
import { asPrisma, bindings, database, isolate } from "./support";
isolate();

test("error middleware maps validation, malformed JSON, HTTP errors and hides internal details", async () => {
  const app = new Hono();
  app.onError(handleError);
  app.notFound(handleNotFound);
  app.get("/validation", (c) => {
    z.object({ name: z.string() }).parse({});
    return c.json({});
  });
  app.get("/json", () => {
    throw new SyntaxError("private detail");
  });
  app.get("/http", () => {
    throw new HTTPException(403, { message: "Forbidden" });
  });
  app.get("/internal", () => {
    throw new Error("private token");
  });
  const validation = await app.request("/validation");
  expect(validation.status).toBe(400);
  expect(
    ((await validation.json()) as { details: { name: string[] } }).details.name,
  ).toBeDefined();
  expect(await (await app.request("/json")).json()).toEqual({
    error: "Malformed JSON body",
  });
  expect((await app.request("/http")).status).toBe(403);
  const internal = await app.request("/internal");
  expect(internal.status).toBe(500);
  expect(await internal.json()).toEqual({ error: "Internal server error" });
  expect((await app.request("/missing")).status).toBe(404);
});

test("CORS allows the configured client with credentials and rejects other origins", async () => {
  const { env } = bindings();
  const app = new Hono<AppEnv>();
  app.use("*", apiCors);
  app.get("/", (c) => c.json({ ok: true }));
  const allowed = await app.request(
    "/",
    { headers: { Origin: env.CLIENT_URL } },
    env,
  );
  expect(allowed.headers.get("Access-Control-Allow-Origin")).toBe(
    env.CLIENT_URL,
  );
  expect(allowed.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  const denied = await app.request(
    "/",
    { headers: { Origin: "https://untrusted.example" } },
    env,
  );
  expect(denied.headers.get("Access-Control-Allow-Origin")).toBeNull();
  const preflight = await app.request(
    "/",
    {
      method: "OPTIONS",
      headers: {
        Origin: env.CLIENT_URL,
        "Access-Control-Request-Method": "PUT",
      },
    },
    env,
  );
  expect(preflight.status).toBe(204);
  expect(preflight.headers.get("Access-Control-Allow-Methods")).toContain(
    "PUT",
  );
});

test("Prisma and session middleware populate context and requireUser reads the session", async () => {
  const db = asPrisma(database());
  const { env } = bindings();
  spyOn(databaseModule, "getDb").mockReturnValue(db);
  const getSession = spyOn(auth, "createAuth").mockReturnValue({
    api: { getSession: async () => ({ user: { id: "user-1" } }) },
  } as unknown as ReturnType<typeof auth.createAuth>);
  const app = new Hono<AppEnv>();
  app.use("*", prismaMiddleware, sessionMiddleware);
  app.get("/api/user", (c) =>
    c.json({ user: requireUser(c), databaseAttached: c.get("prisma") === db }),
  );
  app.get("/api/auth/callback", (c) => c.json({ user: requireUser(c) }));
  expect(await (await app.request("/api/user", {}, env)).json()).toEqual({
    user: { id: "user-1" },
    databaseAttached: true,
  });
  expect(
    await (await app.request("/api/auth/callback", {}, env)).json(),
  ).toEqual({ user: null });
  expect(getSession).toHaveBeenCalledTimes(1);
});

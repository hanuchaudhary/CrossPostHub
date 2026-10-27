import { expect, spyOn, test } from "bun:test";
import worker from "../../apps/api/src/index";
import * as authModule from "../../apps/api/src/lib/auth";
import * as dbModule from "../../apps/api/src/lib/db";
import * as queueModule from "../../apps/api/src/queue";
import type { PostJob } from "../../apps/api/src/types";
import { asPrisma, bindings, database, isolate } from "./support";
isolate();

test("worker health and not-found endpoints run without a database", async () => {
  const health = await worker.fetch(
    new Request("https://api.example.com/health"),
  );
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });
  expect(health.headers.get("X-Content-Type-Options")).toBe("nosniff");
  const missing = await worker.fetch(
    new Request("https://api.example.com/missing"),
  );
  expect(missing.status).toBe(404);
  expect(await missing.json()).toEqual({ error: "Route not found" });
});

test("worker rejects anonymous API requests through real middleware and handles preflight first", async () => {
  const { env } = bindings();
  const db = spyOn(dbModule, "getDb").mockReturnValue(asPrisma(database()));
  spyOn(authModule, "createAuth").mockReturnValue({
    api: { getSession: async () => null },
  } as unknown as ReturnType<typeof authModule.createAuth>);
  const preflight = await worker.fetch(
    new Request(`${env.API_URL}/api/post`, {
      method: "OPTIONS",
      headers: {
        Origin: env.CLIENT_URL,
        "Access-Control-Request-Method": "POST",
      },
    }),
    env,
  );
  expect(preflight.status).toBe(204);
  expect(db).not.toHaveBeenCalled();
  const response = await worker.fetch(
    new Request(`${env.API_URL}/api/post`),
    env,
  );
  expect(response.status).toBe(401);
});

test("worker forwards auth routes to the auth handler without fetching a session", async () => {
  const { env } = bindings();
  spyOn(dbModule, "getDb").mockReturnValue(asPrisma(database()));
  let requestedPath = "";
  spyOn(authModule, "createAuth").mockReturnValue({
    handler: async (request: Request) => {
      requestedPath = new URL(request.url).pathname;
      return Response.json({ handled: true });
    },
    api: {
      getSession: async () => {
        throw new Error("Auth routes should skip session lookup");
      },
    },
  } as unknown as ReturnType<typeof authModule.createAuth>);
  const response = await worker.fetch(
    new Request(`${env.API_URL}/api/auth/test`),
    env,
  );
  expect(await response.json()).toEqual({ handled: true });
  expect(requestedPath).toBe("/api/auth/test");
});

test("worker delegates queue batches to the consumer", async () => {
  const { env } = bindings();
  const batch = { messages: [] } as unknown as MessageBatch<PostJob>;
  const consume = spyOn(queueModule, "consumePosts").mockResolvedValue();
  await worker.queue(batch, env);
  expect(consume).toHaveBeenCalledWith(batch, env);
});

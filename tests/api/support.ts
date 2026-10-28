import { afterEach, beforeEach, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import type { PrismaClient } from "../../apps/api/generated/prisma/client";
import type { AppEnv } from "../../apps/api/src/routes/shared";
import type { Bindings } from "../../apps/api/src/types";
import {
  handleError,
  handleNotFound,
} from "../../apps/api/src/middleware/error-handler";

// Only fixture boundaries are loose: production requests and responses remain typed.
function operation() {
  return mock(async (_input: any): Promise<any> => {
    throw new Error("Unconfigured database operation");
  });
}
function delegate() {
  return {
    findFirst: operation(),
    findMany: operation(),
    findUnique: operation(),
    findUniqueOrThrow: operation(),
    create: operation(),
    update: operation(),
    updateMany: operation(),
    deleteMany: operation(),
    count: operation(),
    upsert: operation(),
  };
}
export function database() {
  return {
    post: delegate(),
    account: delegate(),
    notification: delegate(),
    plan: delegate(),
    user: delegate(),
    transaction: delegate(),
    subscription: delegate(),
  };
}
export type TestDatabase = ReturnType<typeof database>;
export function asPrisma(db: TestDatabase): PrismaClient {
  return db as unknown as PrismaClient;
}

export function bindings() {
  const resources = {
    CROSSPOSTHUB_QUEUE: {
      send: mock(async (_body: unknown, _options?: unknown) => {}),
    },
    MEDIA_BUCKET: {
      get: mock(async (_key: string): Promise<any> => null),
      head: mock(async (_key: string): Promise<any> => null),
      put: mock(async (_key: string, _body: unknown, _options?: unknown) => {}),
      delete: mock(async (_key: string) => {}),
    },
  };
  const env = {
    ...resources,
    DB: {},
    API_URL: "https://api.example.com",
    CLIENT_URL: "https://app.example.com",
    BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
    DODO_PAYMENTS_API_KEY: "test-key",
    DODO_PAYMENTS_WEBHOOK_KEY: "test-webhook-key",
    DODO_PAYMENTS_ENVIRONMENT: "test_mode",
    R2_PUBLIC_URL: "https://cdn.example.com/",
  } as unknown as Bindings;
  return { env, ...resources };
}

export function harness(
  router: Hono<AppEnv>,
  prefix = "/",
  authenticated = true,
) {
  const db = database();
  const resources = bindings();
  const app = new Hono<AppEnv>();
  app.onError(handleError);
  app.notFound(handleNotFound);
  app.use("*", async (c, next) => {
    c.set("prisma", asPrisma(db));
    c.set(
      "session",
      authenticated
        ? ({
            user: {
              id: "user-1",
              email: "user@example.com",
              name: "Test User",
            },
          } as AppEnv["Variables"]["session"])
        : null,
    );
    await next();
  });
  app.route(prefix, router);
  return {
    db,
    app,
    ...resources,
    request: (path: string, init?: RequestInit) =>
      app.request(path, init, resources.env),
  };
}

export function json(body: unknown, method = "POST"): RequestInit {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Unexpected network access must fail instead of contacting live services.
export function isolate() {
  beforeEach(() => {
    spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Unexpected network request in API test"),
    );
    spyOn(console, "error").mockImplementation(() => {});
    spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    mock.restore();
  });
}

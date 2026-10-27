import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { createAuth, type Auth } from "../lib/auth";
import { getDb } from "../lib/db";
import type { PrismaClient } from "../../generated/prisma/client";
import type { Bindings } from "../types";

export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    prisma: PrismaClient;
    session: Auth["$Infer"]["Session"] | null;
  };
};

export type AppContext = Context<AppEnv>;

export function dbFor(c: AppContext) {
  return c.get("prisma");
}

export const prismaMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  c.set("prisma", getDb(c.env.DB));
  await next();
});

export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  if (c.req.path.startsWith("/api/auth/")) {
    c.set("session", null);
    return next();
  }

  const auth = createAuth(c.env, dbFor(c));
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("session", session);
  await next();
});

export function requireUser(c: AppContext) {
  return c.get("session")?.user ?? null;
}

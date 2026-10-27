import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import { z } from "zod";

export function handleError(error: Error, c: Context) {
  if (error instanceof HTTPException) return error.getResponse();

  if (error instanceof z.ZodError) {
    return c.json(
      { error: "Invalid request", details: error.flatten().fieldErrors },
      400,
    );
  }

  if (error instanceof SyntaxError) {
    return c.json({ error: "Malformed JSON body" }, 400);
  }

  console.error("Unhandled request error", {
    method: c.req.method,
    path: c.req.path,
    error,
  });
  return c.json({ error: "Internal server error" }, 500);
}

export function handleNotFound(c: Context) {
  return c.json({ error: "Route not found" }, 404);
}

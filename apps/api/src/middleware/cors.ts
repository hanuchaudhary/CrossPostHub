import { cors } from "hono/cors";

export const apiCors = cors({
  origin: (origin, c) => (origin === c.env.CLIENT_URL ? origin : ""),
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  maxAge: 86400,
});

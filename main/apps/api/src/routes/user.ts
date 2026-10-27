import { Hono, type Context } from "hono";
import { z } from "zod";
import { getDodo } from "../lib/dodo";
import { dbFor, requireUser, type AppContext, type AppEnv } from "./shared";
import type { Bindings, PostJob } from "../types";

function transactionJson(transaction: Record<string, unknown>) {
  return { ...transaction, order_id: transaction.orderId };
}

const app = new Hono<AppEnv>();

app.get("/user", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 1);
  const posts = await dbFor(c).post.findMany({
    where: { userId: user.id, status: "SUCCESS", createdAt: { gte: since } },
    select: { createdAt: true, provider: true },
  });
  const monthly = new Map<
    string,
    { month: string; twitter: number; linkedin: number; instagram: number }
  >();
  for (const post of posts) {
    const key = `${post.createdAt.getUTCFullYear()}-${post.createdAt.getUTCMonth()}`;
    const row = monthly.get(key) ?? {
      month: post.createdAt.toLocaleString("en", {
        month: "short",
        timeZone: "UTC",
      }),
      twitter: 0,
      linkedin: 0,
      instagram: 0,
    };
    if (
      post.provider === "twitter" ||
      post.provider === "linkedin" ||
      post.provider === "instagram"
    )
      row[post.provider] += 1;
    monthly.set(key, row);
  }
  return c.json({
    twitterUserDetails: null,
    monthlyData: [...monthly.values()],
  });
});

app.post("/user", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { githubUsername } = z
    .object({ githubUsername: z.string().regex(/^[a-zA-Z0-9-]+$/) })
    .parse(await c.req.json());
  const response = await fetch(
    `https://api.github.com/users/${githubUsername}`,
    { headers: { "User-Agent": "CrossPostHub" } },
  );
  if (!response.ok)
    return c.json(
      {
        error:
          response.status === 404
            ? "GitHub user not found"
            : "GitHub API request failed",
      },
      response.status === 404 ? 404 : 502,
    );
  return c.json(await response.json());
});

export default app;

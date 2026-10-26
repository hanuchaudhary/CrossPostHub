import { Hono, type Context } from "hono";
import { z } from "zod";
import type { PrismaClient } from "../generated/prisma/client";
import { createAuth } from "./lib/auth";
import { getDb } from "./lib/db";
import { getDodo } from "./lib/dodo";
import type { Bindings, PostJob } from "./types";

type AppContext = Context<{ Bindings: Bindings }>;

async function session(c: AppContext) {
  const db = getDb(c.env.DATABASE_URL);
  return createAuth(c.env, db).api.getSession({ headers: c.req.raw.headers });
}

async function requireUser(c: AppContext) {
  const current = await session(c);
  if (!current?.user) return null;
  return current.user;
}

function transactionJson(transaction: Record<string, unknown>) {
  return { ...transaction, order_id: transaction.orderId };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

export const routes = new Hono<{ Bindings: Bindings }>();

routes.get("/me", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const db = getDb(c.env.DATABASE_URL);
  const result = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      planId: true,
      posts: true,
      accounts: {
        select: {
          providerId: true,
          accountId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return c.json({ user: result });
});

routes.get("/get-apps", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "You are not authenticated" }, 401);
  const accounts = await getDb(c.env.DATABASE_URL).account.findMany({
    where: { userId: user.id, providerId: { notIn: ["credential", "google"] } },
    select: {
      providerId: true,
      accountId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return c.json({
    connectedApps: accounts.map((account) => ({
      ...account,
      provider: account.providerId,
      providerAccountId: account.accountId,
    })),
  });
});

routes.put("/disconnect", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const body = z
    .object({ provider: z.string(), providerAccountId: z.string() })
    .parse(await c.req.json());
  await getDb(c.env.DATABASE_URL).account.deleteMany({
    where: {
      userId: user.id,
      providerId: body.provider,
      accountId: body.providerAccountId,
    },
  });
  return c.json({
    success: true,
    message: `Disconnected ${body.provider} account`,
  });
});

routes.get("/notifications", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const notifications = await getDb(c.env.DATABASE_URL).notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  return c.json({ notifications });
});

routes.post("/notifications", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { notificationId } = z
    .object({ notificationId: z.number() })
    .parse(await c.req.json());
  const result = await getDb(c.env.DATABASE_URL).notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });
  return c.json({ success: result.count === 1 });
});

routes.put("/notifications", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const result = await getDb(c.env.DATABASE_URL).notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return c.json({ message: `${result.count} notifications marked as read` });
});

routes.delete("/notifications", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const id = Number(c.req.query("notificationId"));
  if (!Number.isInteger(id))
    return c.json({ error: "Notification ID is required" }, 400);
  await getDb(c.env.DATABASE_URL).notification.deleteMany({
    where: { id, userId: user.id },
  });
  return c.json({ success: true });
});

routes.put("/notifications/clear", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  await getDb(c.env.DATABASE_URL).notification.deleteMany({
    where: { userId: user.id },
  });
  return c.json({ success: true });
});

routes.get("/payment/pricing", async (c) => {
  const pricingPlans = await getDb(c.env.DATABASE_URL).plan.findMany({
    orderBy: { price: "asc" },
  });
  return c.json({ pricingPlans });
});

routes.get("/payment", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const db = getDb(c.env.DATABASE_URL);
  const [transactions, subscriptions] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id },
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.subscription.findMany({
      where: { userId: user.id, status: "active" },
      include: { plan: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return c.json({
    transactions: transactions.map((item) =>
      transactionJson(item as unknown as Record<string, unknown>),
    ),
    subscriptions,
  });
});

routes.post("/payment", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const { order_id } = z
    .object({ order_id: z.string() })
    .parse(await c.req.json());
  const transaction = await getDb(c.env.DATABASE_URL).transaction.findFirst({
    where: {
      userId: user.id,
      OR: [{ id: order_id }, { orderId: order_id }, { paymentId: order_id }],
    },
  });
  return c.json({
    transaction: transaction
      ? transactionJson(transaction as unknown as Record<string, unknown>)
      : null,
  });
});

routes.get("/payment/subscription", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const subscription = await getDb(c.env.DATABASE_URL).subscription.findFirst({
    where: { userId: user.id, status: "active" },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });
  return subscription
    ? c.json({ status: subscription.status, subscription })
    : c.json({ status: "none" });
});

routes.post("/payment/subscribe", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ message: "Unauthorized" }, 401);
  const { planId } = z
    .object({ planId: z.string().min(1) })
    .parse(await c.req.json());
  const db = getDb(c.env.DATABASE_URL);
  const plan = await db.plan.findFirst({
    where: { OR: [{ id: planId }, { dodoProductId: planId }] },
  });
  if (!plan) return c.json({ error: "Invalid plan" }, 400);
  if (plan.price === 0) {
    const subscription = await db.subscription.create({
      data: { userId: user.id, planId: plan.id, status: "active" },
    });
    return c.json({
      message: "Free plan activated",
      subscriptionId: subscription.id,
      checkout_url: `${c.env.CLIENT_URL}/dashboard`,
    });
  }
  if (!plan.dodoProductId)
    return c.json(
      { error: "This plan is not configured in Dodo Payments" },
      400,
    );
  const dbUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  const checkout = await getDodo(c.env).checkoutSessions.create({
    product_cart: [{ product_id: plan.dodoProductId, quantity: 1 }],
    customer: dbUser.dodoCustomerId
      ? { customer_id: dbUser.dodoCustomerId }
      : { email: dbUser.email, name: dbUser.name },
    metadata: {
      better_auth_user_id: user.id,
      plan_id: plan.id,
      reference_id: crypto.randomUUID(),
    },
    return_url: `${c.env.CLIENT_URL}/payment/success`,
  });
  return c.json({
    checkout_url: checkout.checkout_url,
    checkout_id: checkout.session_id,
  });
});

routes.post("/post/preSignedUrl", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const input = z
    .object({
      fileName: z.string().min(1),
      fileType: z.string().min(1),
      fileSize: z.number().max(200 * 1024 * 1024),
    })
    .parse(await c.req.json());
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `media/${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const query = new URLSearchParams({
    key,
    contentType: input.fileType,
  }).toString();
  return c.json({ url: `${c.env.API_URL}/api/media/upload?${query}`, key });
});

routes.put("/media/upload", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const key = c.req.query("key");
  if (!key?.startsWith(`media/${user.id}/`))
    return c.json({ error: "Invalid media key" }, 400);
  const size = Number(c.req.header("content-length") ?? 0);
  if (size > 200 * 1024 * 1024)
    return c.json({ error: "File size exceeds 200 MB limit" }, 413);
  await c.env.MEDIA_BUCKET.put(key, c.req.raw.body, {
    httpMetadata: {
      contentType:
        c.req.query("contentType") ||
        c.req.header("content-type") ||
        "application/octet-stream",
    },
  });
  return c.json({ success: true, key });
});

routes.post("/post/delete/media", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { mediaKey } = z
    .object({ mediaKey: z.string() })
    .parse(await c.req.json());
  if (!mediaKey.startsWith(`media/${user.id}/`))
    return c.json({ error: "Invalid media key" }, 400);
  await c.env.MEDIA_BUCKET.delete(mediaKey);
  return c.json({ message: "Media deleted successfully" });
});

routes.post("/post", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const form = await c.req.formData();
  const postText = String(form.get("postText") ?? "");
  const mediaKeys = z
    .array(z.string())
    .parse(JSON.parse(String(form.get("mediaKeys") || "[]")));
  const providers = z
    .array(z.enum(["twitter", "linkedin", "instagram"]))
    .min(1)
    .parse(JSON.parse(String(form.get("providers") || "[]")));
  const scheduleAt = String(form.get("scheduleAt") ?? "");
  if (!postText && mediaKeys.length === 0)
    return c.json({ error: "Please enter text or upload media" }, 400);
  const db = getDb(c.env.DATABASE_URL);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const active = await db.subscription.findFirst({
    where: { userId: user.id, status: "active" },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });
  const [postCount, scheduledCount] = await Promise.all([
    db.post.count({
      where: { userId: user.id, createdAt: { gte: monthStart } },
    }),
    db.post.count({
      where: {
        userId: user.id,
        isScheduled: true,
        createdAt: { gte: monthStart },
      },
    }),
  ]);
  const limits =
    active?.plan.title === "Premium"
      ? { posts: Infinity, scheduled: Infinity }
      : active?.plan.title === "Pro"
        ? { posts: 60, scheduled: 20 }
        : { posts: 25, scheduled: 5 };
  if (
    postCount + providers.length > limits.posts ||
    (scheduleAt && scheduledCount + providers.length > limits.scheduled)
  )
    return c.json(
      { error: "Monthly post limit reached. Please upgrade your plan." },
      403,
    );

  const delaySeconds = scheduleAt
    ? Math.max(
        0,
        Math.min(
          43_200,
          Math.floor((new Date(scheduleAt).getTime() - Date.now()) / 1000),
        ),
      )
    : 0;
  const results = [];
  for (const provider of providers) {
    const post = await db.post.create({
      data: {
        userId: user.id,
        text: postText,
        mediaKeys,
        provider,
        scheduledFor: scheduleAt ? new Date(scheduleAt) : null,
        isScheduled: Boolean(scheduleAt),
      },
    });
    const job: PostJob = {
      provider,
      postText,
      mediaKeys,
      userId: user.id,
      postId: post.id,
      scheduledFor: scheduleAt || undefined,
    };
    await c.env.POSTHUB_QUEUE.send(
      job,
      delaySeconds ? { delaySeconds } : undefined,
    );
    await db.notification.create({
      data: {
        userId: user.id,
        type: "POST_STATUS_PROCESSING",
        message: `Processing post for ${provider}`,
      },
    });
    results.push({
      provider,
      jobId: post.id,
      status: "queued",
      scheduledFor: scheduleAt || null,
    });
  }
  return c.json({ results });
});

routes.get("/post", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const take = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? 10)));
  const skip = Math.max(0, Number(c.req.query("offset") ?? 0));
  const posts = await getDb(c.env.DATABASE_URL).post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
  return c.json({
    ScheduledPosts: posts.filter((post) => post.isScheduled),
    PendingPosts: posts.filter((post) => post.status === "PENDING"),
    FailedPosts: posts.filter((post) => post.status === "FAILED"),
    SuccessPosts: posts.filter((post) => post.status === "SUCCESS"),
  });
});

routes.get("/user", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 1);
  const posts = await getDb(c.env.DATABASE_URL).post.findMany({
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

routes.post("/user", async (c) => {
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

routes.post("/generate", async (c) => generateCaption(c));
routes.get("/generate", async (c) => generateCaption(c));

async function generateCaption(c: AppContext) {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  if (!c.env.GEMINI_API_KEY)
    return c.json({ error: "GEMINI_API_KEY is not configured" }, 503);
  const body =
    c.req.method === "GET"
      ? {
          content: c.req.query("content"),
          tone: c.req.query("tone"),
          platform: c.req.query("platform"),
        }
      : await c.req.json<Record<string, string>>();
  if (!body.content) return c.json({ error: "Content is required" }, 400);
  const prompt = `Refine this ${body.platform || "social media"} post in a ${body.tone || "engaging"} tone. Preserve its meaning, add no new claims, and return only the post text:\n\n${body.content}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${c.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!response.ok) return c.json({ error: "Caption generation failed" }, 502);
  const result = await response.json<{
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  }>();
  return c.json({
    caption: result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "",
  });
}

routes.post("/generate/image", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  if (!c.env.FAL_KEY)
    return c.json({ error: "FAL_KEY is not configured" }, 503);
  const { caption } = z
    .object({ caption: z.string().min(1) })
    .parse(await c.req.json());
  const response = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: {
      Authorization: `Key ${c.env.FAL_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ prompt: `Generate an image based on: ${caption}` }),
  });
  if (!response.ok) return c.json({ error: "Image generation failed" }, 502);
  const data = await response.json<{ images?: Array<{ url: string }> }>();
  if (!data.images?.[0]?.url)
    return c.json({ error: "Image generation returned no image" }, 502);
  await getDb(c.env.DATABASE_URL).generatedImage.create({
    data: { userId: user.id, prompt: caption, url: data.images[0].url },
  });
  return c.json({
    images: data,
    status: "success",
    message: "Image generated successfully",
  });
});

routes.onError((error, c) => {
  console.error(error);
  if (error instanceof z.ZodError)
    return c.json(
      { error: error.issues[0]?.message || "Invalid request" },
      400,
    );
  return c.json({ error: errorMessage(error) }, 500);
});

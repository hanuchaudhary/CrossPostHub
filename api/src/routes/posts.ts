import { Hono, type Context } from "hono";
import { z } from "zod";
import { dbFor, requireUser, type AppContext, type AppEnv } from "./shared";
import type { Bindings, PostJob } from "../types";

const app = new Hono<AppEnv>();

app.post("/preSignedUrl", async (c) => {
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

app.post("/delete/media", async (c) => {
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

app.post("", async (c) => {
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
  const db = dbFor(c);
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

app.get("", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const take = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? 10)));
  const skip = Math.max(0, Number(c.req.query("offset") ?? 0));
    const posts = await dbFor(c).post.findMany({
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

export default app;

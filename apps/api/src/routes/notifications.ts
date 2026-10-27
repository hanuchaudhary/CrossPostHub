import { Hono } from "hono";
import { z } from "zod";
import { dbFor, requireUser, type AppContext, type AppEnv } from "./shared";
import type { Bindings } from "../types";

const notifications = new Hono<AppEnv>();

notifications.get("/", async (c: AppContext) => {
  const user = requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const rows = await dbFor(c).notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  return c.json({ notifications: rows });
});

notifications.post("/", async (c: AppContext) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { notificationId } = z
    .object({ notificationId: z.number().int() })
    .parse(await c.req.json());
  const result = await dbFor(c).notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });
  return c.json({ success: result.count === 1 });
});

notifications.put("/", async (c: AppContext) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const result = await dbFor(c).notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return c.json({ updated: result.count });
});

notifications.delete("/", async (c: AppContext) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const id = z.coerce.number().int().parse(c.req.query("notificationId"));
  await dbFor(c).notification.deleteMany({ where: { id, userId: user.id } });
  return c.json({ success: true });
});

notifications.put("/clear", async (c: AppContext) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  await dbFor(c).notification.deleteMany({ where: { userId: user.id } });
  return c.json({ success: true });
});

export default notifications;

import { expect, test } from "bun:test";
import notifications from "../../../apps/api/src/routes/notifications";
import { harness, isolate, json } from "../support";
isolate();

for (const method of ["GET", "POST", "PUT", "DELETE"]) {
  test(`notifications requires a session for ${method}`, async () => {
    const h = harness(notifications, "/notifications", false);
    expect((await h.request("/notifications", { method })).status).toBe(401);
  });
}
test("notifications lists the latest 15 for the current user", async () => {
  const h = harness(notifications, "/notifications");
  h.db.notification.findMany.mockResolvedValue([{ id: 1, read: false }]);
  expect(await (await h.request("/notifications")).json()).toEqual({
    notifications: [{ id: 1, read: false }],
  });
  expect(h.db.notification.findMany).toHaveBeenCalledWith({
    where: { userId: "user-1" },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
});
test("notifications marks a single owned notification as read", async () => {
  const h = harness(notifications, "/notifications");
  h.db.notification.updateMany
    .mockResolvedValueOnce({ count: 1 })
    .mockResolvedValueOnce({ count: 0 });
  expect(
    await (
      await h.request("/notifications", json({ notificationId: 7 }))
    ).json(),
  ).toEqual({ success: true });
  expect(h.db.notification.updateMany).toHaveBeenCalledWith({
    where: { id: 7, userId: "user-1" },
    data: { read: true },
  });
  expect(
    await (
      await h.request("/notifications", json({ notificationId: 8 }))
    ).json(),
  ).toEqual({ success: false });
  expect(
    (await h.request("/notifications", json({ notificationId: "invalid" })))
      .status,
  ).toBe(400);
});
test("notifications marks all unread owned notifications as read", async () => {
  const h = harness(notifications, "/notifications");
  h.db.notification.updateMany.mockResolvedValue({ count: 3 });
  expect(
    await (await h.request("/notifications", { method: "PUT" })).json(),
  ).toEqual({ updated: 3 });
  expect(h.db.notification.updateMany).toHaveBeenCalledWith({
    where: { userId: "user-1", read: false },
    data: { read: true },
  });
});
test("notifications deletes only owned records and validates IDs", async () => {
  const h = harness(notifications, "/notifications");
  h.db.notification.deleteMany.mockResolvedValue({ count: 1 });
  expect(
    (await h.request("/notifications?notificationId=7", { method: "DELETE" }))
      .status,
  ).toBe(200);
  expect(h.db.notification.deleteMany).toHaveBeenCalledWith({
    where: { id: 7, userId: "user-1" },
  });
  expect(
    (
      await h.request("/notifications?notificationId=invalid", {
        method: "DELETE",
      })
    ).status,
  ).toBe(400);
  expect(
    (await h.request("/notifications/clear", { method: "PUT" })).status,
  ).toBe(200);
  expect(h.db.notification.deleteMany).toHaveBeenLastCalledWith({
    where: { userId: "user-1" },
  });
});

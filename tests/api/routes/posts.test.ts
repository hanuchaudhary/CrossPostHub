import { expect, test } from "bun:test";
import posts from "../../../apps/api/src/routes/posts";
import { harness, isolate, json } from "../support";

isolate();

function form(overrides: Record<string, string | undefined> = {}): RequestInit {
  const body = new FormData();
  for (const [key, value] of Object.entries({
    postText: "Hello",
    providers: '["twitter"]',
    mediaKeys: "[]",
    ...overrides,
  }))
    if (value !== undefined) body.set(key, value);
  return { method: "POST", body };
}
function ready() {
  const h = harness(posts, "/post");
  h.db.subscription.findFirst.mockResolvedValue(null);
  h.db.post.count.mockResolvedValue(0);
  h.db.post.create.mockResolvedValue({ id: "post-1" });
  h.db.notification.create.mockResolvedValue({});
  return h;
}

for (const [method, path] of [
  ["GET", "/post"],
  ["POST", "/post"],
  ["POST", "/post/preSignedUrl"],
  ["POST", "/post/delete/media"],
]) {
  test(`posts rejects unauthenticated ${method} ${path}`, async () => {
    const h = harness(posts, "/post", false);
    expect((await h.request(path!, { method })).status).toBe(401);
    expect(h.db.post.create).not.toHaveBeenCalled();
  });
}

test("posts creates an upload URL scoped to the current user", async () => {
  const h = ready();
  const response = await h.request(
    "/post/preSignedUrl",
    json({ fileName: "my image.jpg", fileType: "image/jpeg", fileSize: 100 }),
  );
  expect(response.status).toBe(200);
  const body = (await response.json()) as { key: string; url: string };
  expect(body.key).toMatch(/^media\/user-1\/.*-my-image.jpg$/);
  const url = new URL(body.url);
  expect(url.origin).toBe(h.env.API_URL);
  expect(url.searchParams.get("key")).toBe(body.key);
  expect(url.searchParams.get("contentType")).toBe("image/jpeg");
  expect(
    (
      await h.request(
        "/post/preSignedUrl",
        json({
          fileName: "big.jpg",
          fileType: "image/jpeg",
          fileSize: 201 * 1024 * 1024,
        }),
      )
    ).status,
  ).toBe(400);
});

test("posts deletes owned media and rejects another user's key", async () => {
  const h = ready();
  expect(
    (
      await h.request(
        "/post/delete/media",
        json({ mediaKey: "media/other/photo.jpg" }),
      )
    ).status,
  ).toBe(400);
  expect(h.MEDIA_BUCKET.delete).not.toHaveBeenCalled();
  expect(
    (
      await h.request(
        "/post/delete/media",
        json({ mediaKey: "media/user-1/photo.jpg" }),
      )
    ).status,
  ).toBe(200);
  expect(h.MEDIA_BUCKET.delete).toHaveBeenCalledWith("media/user-1/photo.jpg");
});

test("posts validates providers, content, and malformed embedded JSON before writing", async () => {
  const h = ready();
  for (const input of [
    { providers: "[]" },
    { providers: '["unknown"]' },
    { mediaKeys: "{" },
    { postText: "" },
  ]) {
    expect((await h.request("/post", form(input))).status).toBe(400);
  }
  expect(h.db.post.create).not.toHaveBeenCalled();
  expect(h.CROSSPOSTHUB_QUEUE.send).not.toHaveBeenCalled();
});

test("posts queues each selected provider and returns its job", async () => {
  const h = ready();
  h.db.post.create
    .mockResolvedValueOnce({ id: "post-twitter" })
    .mockResolvedValueOnce({ id: "post-instagram" });
  const response = await h.request(
    "/post",
    form({ providers: '["twitter","instagram"]' }),
  );
  expect(response.status).toBe(200);
  expect(((await response.json()) as { results: unknown[] }).results).toEqual([
    {
      provider: "twitter",
      jobId: "post-twitter",
      status: "queued",
      scheduledFor: null,
    },
    {
      provider: "instagram",
      jobId: "post-instagram",
      status: "queued",
      scheduledFor: null,
    },
  ]);
  expect(h.CROSSPOSTHUB_QUEUE.send).toHaveBeenCalledTimes(2);
  expect(h.CROSSPOSTHUB_QUEUE.send.mock.calls[0]![0]).toMatchObject({
    userId: "user-1",
    provider: "twitter",
    postId: "post-twitter",
    postText: "Hello",
  });
  expect(h.db.notification.create).toHaveBeenCalledTimes(2);
});

for (const [title, limit] of [
  ["Free", 25],
  ["Pro", 60],
] as const) {
  test(`posts enforces ${title} monthly limits before writing`, async () => {
    const h = ready();
    h.db.subscription.findFirst.mockResolvedValue({ plan: { title } });
    h.db.post.count.mockResolvedValueOnce(limit - 1).mockResolvedValueOnce(0);
    expect(
      (await h.request("/post", form({ providers: '["twitter","linkedin"]' })))
        .status,
    ).toBe(403);
    expect(h.db.post.create).not.toHaveBeenCalled();
  });
}

test("posts enforces scheduled limits and permits Premium usage", async () => {
  const h = ready();
  h.db.post.count.mockResolvedValueOnce(0).mockResolvedValueOnce(5);
  expect(
    (
      await h.request(
        "/post",
        form({ scheduleAt: new Date(Date.now() + 60_000).toISOString() }),
      )
    ).status,
  ).toBe(403);
  h.db.subscription.findFirst.mockResolvedValue({ plan: { title: "Premium" } });
  h.db.post.count.mockResolvedValue(1000);
  expect((await h.request("/post", form())).status).toBe(200);
});

test("posts persists schedules and caps the initial queue delay", async () => {
  const h = ready();
  const scheduleAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  expect((await h.request("/post", form({ scheduleAt }))).status).toBe(200);
  expect(h.db.post.create.mock.calls[0]![0].data).toMatchObject({
    userId: "user-1",
    isScheduled: true,
    scheduledFor: new Date(scheduleAt),
  });
  expect(h.CROSSPOSTHUB_QUEUE.send.mock.calls[0]![1]).toEqual({
    delaySeconds: 43_200,
  });
});

test("posts lists user-scoped status groups and clamps pagination", async () => {
  const h = ready();
  const rows = [
    { id: "1", status: "PENDING", isScheduled: true },
    { id: "2", status: "SUCCESS" },
    { id: "3", status: "FAILED" },
  ];
  h.db.post.findMany.mockResolvedValue(rows);
  const response = await h.request("/post?limit=200&offset=-10");
  expect(await response.json()).toEqual({
    ScheduledPosts: [rows[0]],
    PendingPosts: [rows[0]],
    SuccessPosts: [rows[1]],
    FailedPosts: [rows[2]],
  });
  expect(h.db.post.findMany.mock.calls[0]![0]).toMatchObject({
    where: { userId: "user-1" },
    take: 50,
    skip: 0,
  });
});

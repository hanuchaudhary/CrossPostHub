import { expect, mock, spyOn, test } from "bun:test";
import { consumePosts } from "../../apps/api/src/queue";
import { CrossPostHub } from "../../apps/api/src/core";
import * as accountModule from "../../apps/api/src/lib/publishing-account";
import { PublishError } from "../../apps/api/src/core";
import * as dbModule from "../../apps/api/src/lib/db";
import type { PostJob } from "../../apps/api/src/types";
import { asPrisma, bindings, database, isolate } from "./support";
isolate();

function fixture(overrides: Partial<PostJob> = {}, attempts = 1) {
  const db = database();
  const resources = bindings();
  spyOn(dbModule, "getDb").mockReturnValue(asPrisma(db));
  const publish = spyOn(CrossPostHub.prototype, "publish").mockResolvedValue({
    provider: "twitter",
    response: { id: "published-1" },
  });
  db.post.findFirst.mockResolvedValue({ id: "post-1", status: "PENDING" });
  const account = spyOn(
    accountModule,
    "getPublishingAccount",
  ).mockResolvedValue({ accountId: "account-1", accessToken: "test-token" });
  db.post.update.mockResolvedValue({});
  db.notification.create.mockResolvedValue({});
  const body: PostJob = {
    postId: "post-1",
    userId: "user-1",
    provider: "twitter",
    postText: "Hello",
    mediaKeys: [],
    ...overrides,
  };
  const message = {
    body,
    attempts,
    ack: mock(() => {}),
    retry: mock((_options?: unknown) => {}),
  };
  const batch = { messages: [message] } as unknown as MessageBatch<PostJob>;
  return {
    db,
    publish,
    account,
    message,
    batch,
    ...resources,
    consume: () => consumePosts(batch, resources.env),
  };
}

test("queue publishes with owned credentials, persists success, notifies, and acknowledges", async () => {
  const h = fixture();
  await h.consume();
  expect(h.db.post.findFirst).toHaveBeenCalledWith({
    where: { id: "post-1", userId: "user-1" },
  });
  expect(h.account).toHaveBeenCalledWith(asPrisma(h.db), h.env, h.message.body);
  expect(h.publish).toHaveBeenCalledWith({
    provider: "twitter",
    account: { accountId: "account-1", accessToken: "test-token" },
    text: "Hello",
    media: [],
  });
  expect(h.db.post.update).toHaveBeenCalledWith({
    where: { id: "post-1" },
    data: { status: "SUCCESS", provider: "twitter" },
  });
  expect(h.db.notification.create.mock.calls[0]![0].data).toMatchObject({
    userId: "user-1",
    type: "POST_STATUS_SUCCESS",
  });
  expect(h.message.ack).toHaveBeenCalledTimes(1);
  expect(h.message.retry).not.toHaveBeenCalled();
});

for (const post of [null, { id: "post-1", status: "SUCCESS" }]) {
  test(`queue skips ${post ? "already successful" : "missing"} posts`, async () => {
    const h = fixture();
    h.db.post.findFirst.mockResolvedValue(post);
    await h.consume();
    expect(h.publish).not.toHaveBeenCalled();
    expect(h.db.account.findFirst).not.toHaveBeenCalled();
    expect(h.message.ack).toHaveBeenCalledTimes(1);
  });
}

test("queue re-enqueues future jobs with capped delays", async () => {
  const h = fixture({
    scheduledFor: new Date(Date.now() + 86_400_000).toISOString(),
  });
  await h.consume();
  expect(h.POSTHUB_QUEUE.send).toHaveBeenCalledWith(h.message.body, {
    delaySeconds: 43_200,
  });
  expect(h.db.post.findFirst).not.toHaveBeenCalled();
  expect(h.publish).not.toHaveBeenCalled();
  expect(h.message.ack).toHaveBeenCalledTimes(1);
});

test("queue publishes schedules that are already due", async () => {
  const h = fixture({
    scheduledFor: new Date(Date.now() - 60_000).toISOString(),
  });
  await h.consume();
  expect(h.publish).toHaveBeenCalledTimes(1);
  expect(h.POSTHUB_QUEUE.send).not.toHaveBeenCalled();
});

for (const attempts of [1, 2]) {
  test(`queue retries provider failures at attempt ${attempts}`, async () => {
    const h = fixture({}, attempts);
    h.publish.mockRejectedValue(new Error("Provider unavailable"));
    await h.consume();
    expect(h.message.retry).toHaveBeenCalledWith({
      delaySeconds: 10 * 2 ** attempts,
    });
    expect(h.message.ack).not.toHaveBeenCalled();
    expect(h.db.post.update).not.toHaveBeenCalled();
  });
}

test("queue marks exhausted jobs failed and notifies before acknowledging", async () => {
  const h = fixture({}, 3);
  h.publish.mockRejectedValue(new Error("Provider unavailable"));
  await h.consume();
  expect(h.db.post.update).toHaveBeenCalledWith({
    where: { id: "post-1" },
    data: { status: "FAILED" },
  });
  expect(h.db.notification.create.mock.calls[0]![0].data).toMatchObject({
    userId: "user-1",
    type: "POST_STATUS_FAILED",
  });
  expect(h.message.retry).not.toHaveBeenCalled();
  expect(h.message.ack).toHaveBeenCalledTimes(1);
});

test("queue fails accounts with missing credentials without publishing", async () => {
  const h = fixture();
  h.account.mockRejectedValue(new PublishError("Account is not connected"));
  await h.consume();
  expect(h.publish).not.toHaveBeenCalled();
  expect(h.message.retry).not.toHaveBeenCalled();
  expect(h.db.post.update).toHaveBeenCalledWith({
    where: { id: "post-1" },
    data: { status: "FAILED" },
  });
});

test("queue adapts R2 byte loaders and encodes public Instagram URLs", async () => {
  const h = fixture({
    provider: "instagram",
    mediaKeys: ["media/user-1/my photo.jpg"],
  });
  const bytes = new ArrayBuffer(4);
  h.MEDIA_BUCKET.get.mockResolvedValue({
    arrayBuffer: async () => bytes,
    httpMetadata: { contentType: "image/jpeg" },
  });
  h.MEDIA_BUCKET.head.mockResolvedValue({
    httpMetadata: { contentType: "image/jpeg" },
  });
  h.publish.mockImplementation(async (request) => {
    expect(await request.media![0]!.load()).toEqual({
      data: bytes,
      contentType: "image/jpeg",
    });
    expect(await request.media![0]!.getPublicUrl!()).toEqual({
      url: "https://cdn.example.com/media/user-1/my%20photo.jpg",
      contentType: "image/jpeg",
    });
    return { provider: "instagram", response: { id: "ig-post" } };
  });
  await h.consume();
  expect(h.message.ack).toHaveBeenCalledTimes(1);
  expect(h.message.retry).not.toHaveBeenCalled();
});

test("queue retries missing R2 media and missing public URL configuration", async () => {
  for (const missingConfig of [false, true]) {
    const h = fixture({
      provider: "instagram",
      mediaKeys: ["media/user-1/photo.jpg"],
    });
    if (missingConfig) h.env.R2_PUBLIC_URL = undefined;
    h.publish.mockImplementation(async (request) => {
      await request.media![0]!.getPublicUrl!();
      return { provider: "instagram", response: {} };
    });
    await h.consume();
    expect(h.message.retry).toHaveBeenCalledTimes(1);
    expect(h.message.ack).not.toHaveBeenCalled();
  }
});

test("queue processes healthy jobs even when another job fails", async () => {
  const h = fixture();
  const second = {
    ...h.message,
    body: { ...h.message.body, postId: "post-2" },
    ack: mock(() => {}),
    retry: mock(() => {}),
  };
  h.publish
    .mockRejectedValueOnce(new Error("Transient failure"))
    .mockResolvedValueOnce({ provider: "twitter", response: {} });
  await consumePosts(
    { messages: [h.message, second] } as unknown as MessageBatch<PostJob>,
    h.env,
  );
  expect(h.message.retry).toHaveBeenCalledTimes(1);
  expect(second.ack).toHaveBeenCalledTimes(1);
});

test("queue honors provider rate-limit delays and fails permanent permission errors immediately", async () => {
  const limited = fixture();
  limited.publish.mockRejectedValue(
    new PublishError("Rate limited", true, 900),
  );
  await limited.consume();
  expect(limited.message.retry).toHaveBeenCalledWith({ delaySeconds: 900 });
  expect(limited.message.ack).not.toHaveBeenCalled();
  const denied = fixture();
  denied.publish.mockRejectedValue(
    new PublishError("Publishing permission is missing"),
  );
  await denied.consume();
  expect(denied.message.retry).not.toHaveBeenCalled();
  expect(denied.message.ack).toHaveBeenCalledTimes(1);
  expect(denied.db.post.update.mock.calls[0]![0].data.status).toBe("FAILED");
});

test("queue supplies R2 streaming bodies and rejects media owned by another user", async () => {
  const h = fixture({ mediaKeys: ["media/user-1/video.mp4"] });
  const bytes = new Uint8Array([1, 2, 3]);
  h.MEDIA_BUCKET.get.mockResolvedValue({
    body: new Blob([bytes]).stream(),
    size: 3,
    httpMetadata: { contentType: "video/mp4" },
  });
  h.publish.mockImplementation(async (request) => {
    const source = await request.media![0]!.open!();
    expect(source.size).toBe(3);
    expect(source.contentType).toBe("video/mp4");
    expect(await new Response(source.stream).arrayBuffer()).toEqual(
      bytes.buffer,
    );
    return { provider: "twitter", response: { id: "post-1" } };
  });
  await h.consume();
  expect(h.message.retry).not.toHaveBeenCalled();
  const other = fixture({ mediaKeys: ["media/other-user/photo.jpg"] });
  other.publish.mockImplementation(async (request) => {
    await request.media![0]!.open!();
    return { provider: "twitter", response: {} };
  });
  await other.consume();
  expect(other.MEDIA_BUCKET.get).not.toHaveBeenCalled();
  expect(other.message.retry).not.toHaveBeenCalled();
  expect(other.db.post.update.mock.calls[0]![0].data.status).toBe("FAILED");
});

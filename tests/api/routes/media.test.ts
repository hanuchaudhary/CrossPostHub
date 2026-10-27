import { expect, test } from "bun:test";
import media from "../../../apps/api/src/routes/media";
import { harness, isolate } from "../support";
isolate();
test("media upload requires authentication and an owned key", async () => {
  const anonymous = harness(media, "/media", false);
  expect(
    (
      await anonymous.request("/media/upload?key=media/user-1/a.jpg", {
        method: "PUT",
      })
    ).status,
  ).toBe(401);
  const h = harness(media, "/media");
  for (const suffix of ["", "?key=media/other/a.jpg"])
    expect(
      (await h.request(`/media/upload${suffix}`, { method: "PUT" })).status,
    ).toBe(400);
  expect(h.MEDIA_BUCKET.put).not.toHaveBeenCalled();
});
test("media upload stores the request bytes and content type", async () => {
  const h = harness(media, "/media");
  const response = await h.request(
    "/media/upload?key=media/user-1/a.jpg&contentType=image/jpeg",
    {
      method: "PUT",
      body: "image-bytes",
      headers: { "content-type": "application/octet-stream" },
    },
  );
  expect(await response.json()).toEqual({
    success: true,
    key: "media/user-1/a.jpg",
  });
  const [key, body, options] = h.MEDIA_BUCKET.put.mock.calls[0]!;
  expect(key).toBe("media/user-1/a.jpg");
  expect(await new Response(body as ReadableStream).text()).toBe("image-bytes");
  expect(options).toEqual({ httpMetadata: { contentType: "image/jpeg" } });
});
test("media upload falls back to the request content type and rejects oversized requests", async () => {
  const h = harness(media, "/media");
  expect(
    (
      await h.request("/media/upload?key=media/user-1/a.png", {
        method: "PUT",
        body: "bytes",
        headers: { "content-type": "image/png" },
      })
    ).status,
  ).toBe(200);
  expect(h.MEDIA_BUCKET.put.mock.calls[0]![2]).toEqual({
    httpMetadata: { contentType: "image/png" },
  });
  expect(
    (
      await h.request("/media/upload?key=media/user-1/large.jpg", {
        method: "PUT",
        body: "x",
        headers: { "content-length": String(201 * 1024 * 1024) },
      })
    ).status,
  ).toBe(413);
  expect(h.MEDIA_BUCKET.put).toHaveBeenCalledTimes(1);
});

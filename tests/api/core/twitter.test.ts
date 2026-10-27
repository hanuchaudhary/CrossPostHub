import { expect, test } from "bun:test";
import {
  CrossPostHub,
  PublishError,
  TwitterProvider,
  type Fetch,
  type PublishContent,
  type PublishMedia,
} from "../../../apps/api/src/core";

const content: PublishContent = {
  account: { accountId: "account-1", accessToken: "test-token" },
  text: "Hello from X",
};
function media(
  contentType = "image/png",
  bytes = new Uint8Array([1, 2, 3, 4]),
): PublishMedia {
  return {
    async load() {
      return { data: bytes.buffer as ArrayBuffer, contentType };
    },
  };
}

test("X creates text posts using the official SDK and user OAuth token", async () => {
  let calls = 0;
  const fetch: Fetch = async (url, init) => {
    calls++;
    expect(String(url)).toBe("https://api.x.com/2/tweets");
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
    expect(new Headers(init?.headers).get("User-Agent")).toContain(
      "xdk-typescript",
    );
    expect(JSON.parse(String(init?.body))).toEqual({ text: content.text });
    return Response.json({ data: { id: "post-1", text: content.text } });
  };
  const hub = new CrossPostHub([new TwitterProvider(fetch)]);
  expect(await hub.publish({ ...content, provider: "twitter" })).toEqual({
    provider: "twitter",
    response: { data: { id: "post-1", text: content.text } },
  });
  expect(calls).toBe(1);
});

test("X uploads images with v2 initialize/append/finalize and attaches ordered media IDs", async () => {
  const requests: { url: string; body: any }[] = [];
  let image = 0;
  const fetch: Fetch = async (url, init) => {
    const body = JSON.parse(String(init?.body ?? "{}"));
    requests.push({ url: String(url), body });
    if (String(url).endsWith("/initialize")) {
      image++;
      expect(body).toMatchObject({
        media_type: "image/png",
        media_category: "tweet_image",
        total_bytes: 4,
      });
      return Response.json({ data: { id: `media-${image}` } });
    }
    if (String(url).endsWith("/append")) {
      expect(body).toEqual({ media: "AQIDBA==", segment_index: 0 });
      return Response.json({ data: {} });
    }
    if (String(url).endsWith("/finalize"))
      return Response.json({ data: { id: `media-${image}` } });
    expect(body).toEqual({
      text: content.text,
      media: { media_ids: ["media-1", "media-2"] },
    });
    return Response.json({ data: { id: "post-images" } });
  };
  await new TwitterProvider(fetch).publish({
    ...content,
    media: [media(), media()],
  });
  expect(requests).toHaveLength(7);
});

test("X streams video in bounded segments and waits for processing before creating a post", async () => {
  const size = 5 * 1024 ** 2 + 3;
  const segments: number[] = [];
  const waits: number[] = [];
  let checks = 0;
  let posted = false;
  const fetch: Fetch = async (url, init) => {
    const body = JSON.parse(String(init?.body ?? "{}"));
    if (String(url).endsWith("/initialize")) {
      expect(body.media_category).toBe("tweet_video");
      expect(body.total_bytes).toBe(size);
      return Response.json({ data: { id: "video-1" } });
    }
    if (String(url).endsWith("/append")) {
      segments.push(atob(body.media).length);
      expect(body.segment_index).toBe(segments.length - 1);
      return Response.json({ data: {} });
    }
    if (String(url).endsWith("/finalize"))
      return Response.json({
        data: {
          id: "video-1",
          processing_info: { state: "pending", check_after_secs: 2 },
        },
      });
    if (init?.method === "GET") {
      checks++;
      expect(String(url)).toContain("media_id=video-1");
      return Response.json({
        data: { id: "video-1", processing_info: { state: "succeeded" } },
      });
    }
    posted = true;
    expect(checks).toBe(1);
    return Response.json({ data: { id: "post-video" } });
  };
  await new TwitterProvider(fetch, {
    wait: async (ms) => {
      waits.push(ms);
    },
  }).publish({
    ...content,
    media: [
      {
        async load() {
          throw new Error("Do not buffer the file");
        },
        async open() {
          return {
            size,
            contentType: "video/mp4",
            stream: new ReadableStream({
              start(controller) {
                controller.enqueue(new Uint8Array(size));
                controller.close();
              },
            }),
          };
        },
      },
    ],
  });
  expect(segments).toEqual([5 * 1024 ** 2, 3]);
  expect(waits).toEqual([2000]);
  expect(posted).toBe(true);
});

test("X rejects invalid content and media combinations before making API requests", async () => {
  const provider = new TwitterProvider(async () => {
    throw new Error("Unexpected fetch");
  });
  await expect(provider.publish({ ...content, text: "" })).rejects.toThrow(
    "requires text or media",
  );
  await expect(
    provider.publish({
      ...content,
      media: Array.from({ length: 5 }, () => media()),
    }),
  ).rejects.toThrow("at most 4");
  await expect(
    provider.publish({ ...content, media: [media(), media("video/mp4")] }),
  ).rejects.toThrow("single GIF/video");
  await expect(
    provider.publish({ ...content, media: [media("application/pdf")] }),
  ).rejects.toThrow("supports JPEG");
  await expect(
    provider.publish({
      ...content,
      media: [media("image/png", new Uint8Array(5 * 1024 ** 2 + 1))],
    }),
  ).rejects.toThrow("maximum 5 MB");
});

test("X reports permanent auth errors and preserves rate-limit delays without leaking tokens", async () => {
  for (const status of [401, 403, 429, 500]) {
    const fetch: Fetch = async () =>
      Response.json(
        { message: "secret-token should not be logged" },
        { status, headers: { "retry-after": "90" } },
      );
    try {
      await new TwitterProvider(fetch).publish(content);
      throw new Error("Expected rejection");
    } catch (error) {
      expect(error).toBeInstanceOf(PublishError);
      const failure = error as PublishError;
      expect(failure.retryable).toBe(status >= 429);
      expect(failure.message).not.toContain("secret-token");
      if (status === 429) expect(failure.retryAfterSeconds).toBe(90);
    }
  }
});

test("X stops on failed media processing and bounds processing polls", async () => {
  for (const state of ["failed", "pending"]) {
    let posted = false;
    const fetch: Fetch = async (url) => {
      if (String(url).endsWith("/tweets")) posted = true;
      if (String(url).endsWith("/append")) return Response.json({ data: {} });
      return Response.json({
        data: {
          id: "media-1",
          processing_info: { state, check_after_secs: 60 },
        },
      });
    };
    await expect(
      new TwitterProvider(fetch, { wait: async () => {} }).publish({
        ...content,
        media: [media("image/gif")],
      }),
    ).rejects.toThrow(state === "failed" ? "processing failed" : "timed out");
    expect(posted).toBe(false);
  }
});

test("X does not mark incomplete or partial-error API responses successful", async () => {
  for (const response of [
    {},
    { data: { id: "post-1" }, errors: [{ title: "failure" }] },
  ]) {
    const fetch: Fetch = async () => Response.json(response);
    await expect(new TwitterProvider(fetch).publish(content)).rejects.toThrow(
      "did not confirm",
    );
  }
});

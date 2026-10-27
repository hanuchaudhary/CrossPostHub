import assert from "node:assert/strict";
import { test } from "node:test";
import { CrossPostHub, InstagramProvider } from "../../../apps/api/src/core";
import type {
  Fetch,
  PublishContent,
  PublishMedia,
} from "../../../apps/api/src/core";

function media(
  url = "https://cdn.example/photo.jpg",
  contentType = "image/jpeg",
): PublishMedia {
  return {
    async load() {
      throw new Error("Instagram should not download media bytes");
    },
    async getPublicUrl() {
      return { url, contentType };
    },
  };
}

const content: PublishContent = {
  account: { accountId: "ig-1", accessToken: "test-token" },
  text: "Hello & welcome 🌍",
  media: [media()],
};

test("Instagram creates, checks, and publishes a single image through CrossPostHub", async () => {
  const calls: string[] = [];
  const fetch: Fetch = async (url, init) => {
    calls.push(String(url));
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "Bearer test-token",
    );
    assert.ok(!String(url).includes("test-token"));
    const body = new URLSearchParams(String(init?.body ?? ""));
    if (calls.length === 1) {
      assert.equal(url, "https://graph.instagram.com/v25.0/ig-1/media");
      assert.equal(init?.method, "POST");
      assert.equal(body.get("image_url"), "https://cdn.example/photo.jpg");
      assert.equal(body.get("caption"), content.text);
      return Response.json({ id: "container-1" });
    }
    if (calls.length === 2) {
      assert.equal(
        url,
        "https://graph.instagram.com/v25.0/container-1?fields=status_code",
      );
      assert.equal(init?.method, "GET");
      return Response.json({ status_code: "FINISHED" });
    }
    assert.equal(url, "https://graph.instagram.com/v25.0/ig-1/media_publish");
    assert.equal(body.get("creation_id"), "container-1");
    return Response.json({ id: "post-1" });
  };
  const hub = new CrossPostHub([new InstagramProvider(fetch)]);
  assert.deepEqual(await hub.publish({ provider: "instagram", ...content }), {
    provider: "instagram",
    response: { id: "post-1" },
  });
  assert.equal(calls.length, 3);
});

test("Instagram creates carousel children in input order and publishes the parent", async () => {
  const created: URLSearchParams[] = [];
  const fetch: Fetch = async (url, init) => {
    if (init?.method === "GET")
      return Response.json({ status_code: "FINISHED" });
    const body = new URLSearchParams(String(init?.body));
    if (String(url).endsWith("/media_publish")) {
      assert.equal(body.get("creation_id"), "container-3");
      return Response.json({ id: "post-carousel" });
    }
    created.push(body);
    return Response.json({ id: `container-${created.length}` });
  };
  await new InstagramProvider(fetch).publish({
    ...content,
    media: [media(), media("https://cdn.example/second.jpg")],
  });
  assert.equal(created.length, 3);
  assert.equal(created[0]!.get("is_carousel_item"), "true");
  assert.equal(created[1]!.get("image_url"), "https://cdn.example/second.jpg");
  assert.equal(created[2]!.get("children"), "container-1,container-2");
  assert.equal(created[2]!.get("media_type"), "CAROUSEL");
  assert.equal(created[2]!.get("caption"), content.text);
});

test("Instagram publishes Reels only after processing finishes", async () => {
  let checks = 0;
  let published = false;
  const waits: number[] = [];
  const fetch: Fetch = async (url, init) => {
    if (init?.method === "GET") {
      return Response.json({
        status_code: ++checks === 1 ? "IN_PROGRESS" : "FINISHED",
      });
    }
    if (String(url).endsWith("/media_publish")) {
      assert.equal(checks, 2);
      published = true;
      return Response.json({ id: "reel-1" });
    }
    const body = new URLSearchParams(String(init?.body));
    assert.equal(body.get("media_type"), "REELS");
    assert.equal(body.get("video_url"), "https://cdn.example/video.mp4");
    return Response.json({ id: "reel-container" });
  };
  await new InstagramProvider(fetch, {
    wait: async (ms) => {
      waits.push(ms);
    },
  }).publish({
    ...content,
    media: [media("https://cdn.example/video.mp4", "video/mp4")],
  });
  assert.equal(published, true);
  assert.deepEqual(waits, [60_000]);
});

test("Instagram rejects unsupported media before making API requests", async () => {
  const fetch: Fetch = async () => {
    throw new Error("Unexpected API request");
  };
  const provider = new InstagramProvider(fetch);
  await assert.rejects(provider.publish({ ...content, media: [] }), /1 to 10/);
  await assert.rejects(
    provider.publish({
      ...content,
      media: Array.from({ length: 11 }, () => media()),
    }),
    /1 to 10/,
  );
  await assert.rejects(
    provider.publish({
      ...content,
      media: [
        {
          async load() {
            throw new Error("Unexpected load");
          },
        },
      ],
    }),
    /public URL/,
  );
  for (const url of [
    "invalid",
    "http://cdn.example/a.jpg",
    "https://user:password@cdn.example/a.jpg",
  ]) {
    await assert.rejects(
      provider.publish({ ...content, media: [media(url)] }),
      /HTTPS URL/,
    );
  }
  await assert.rejects(
    provider.publish({
      ...content,
      media: [media("https://cdn.example/a.png", "image/png")],
    }),
    /JPEG/,
  );
  await assert.rejects(
    provider.publish({
      ...content,
      media: [media(), media("https://cdn.example/v.mp4", "video/mp4")],
    }),
    /carousels/,
  );
});

test("Instagram stops on failed or expired containers and bounds processing waits", async () => {
  for (const status_code of [
    "ERROR",
    "EXPIRED",
    "PUBLISHED",
    undefined,
    "IN_PROGRESS",
  ]) {
    let checks = 0;
    let waits = 0;
    const fetch: Fetch = async (url, init) => {
      if (init?.method === "GET") {
        checks++;
        return Response.json({ status_code });
      }
      assert.ok(!String(url).endsWith("/media_publish"));
      return Response.json({ id: "container" });
    };
    await assert.rejects(
      new InstagramProvider(fetch, {
        wait: async () => {
          waits++;
        },
      }).publish(content),
      status_code === "IN_PROGRESS" ? /timed out/ : /processing failed/,
    );
    assert.equal(checks, status_code === "IN_PROGRESS" ? 6 : 1);
    assert.equal(waits, status_code === "IN_PROGRESS" ? 5 : 0);
  }
});

test("Instagram propagates API failures at creation, status, and publish without leaking response messages", async () => {
  for (const stage of [1, 2, 3]) {
    let calls = 0;
    const fetch: Fetch = async (_url, init) => {
      if (++calls === stage)
        return Response.json(
          { error: { code: 190, message: "secret-token" } },
          { status: 400 },
        );
      return init?.method === "GET"
        ? Response.json({ status_code: "FINISHED" })
        : Response.json({ id: "container" });
    };
    await assert.rejects(
      new InstagramProvider(fetch).publish(content),
      (error: Error) => {
        assert.match(
          error.message,
          /Instagram request failed \(400, code 190\)/,
        );
        assert.ok(!error.message.includes("secret-token"));
        return true;
      },
    );
    assert.equal(calls, stage);
  }
});

test("Instagram rejects malformed success responses and network failures", async () => {
  for (const body of [null, {}, { id: 1 }, "invalid-json"]) {
    const fetch: Fetch = async () =>
      body === "invalid-json" ? new Response("not json") : Response.json(body);
    await assert.rejects(
      new InstagramProvider(fetch).publish(content),
      /Instagram/,
    );
  }
  const fetch: Fetch = async () => {
    throw new Error("Network unavailable");
  };
  await assert.rejects(
    new InstagramProvider(fetch).publish(content),
    /Network unavailable/,
  );
});

import { expect, test } from "bun:test";
import { LinkedInProvider, PublishError, type Fetch, type PublishContent, type PublishMedia } from "../../../apps/api/src/core";
const content: PublishContent = { account: { accountId: "person-1", accessToken: "test-token" }, text: "Hello LinkedIn" };
function media(contentType = "image/png", data = new Uint8Array([1, 2, 3, 4]).buffer): PublishMedia {
  return { async load() { return { data, contentType }; } };
}
const uploadUrl = "https://www.linkedin.com/dms-uploads/image-1";
function created() { return new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:post-1" } }); }

test("LinkedIn creates versioned REST text posts and reads the ID from headers", async () => {
  const fetch: Fetch = async (url, init) => {
    expect(url).toBe("https://api.linkedin.com/rest/posts");
    expect(new Headers(init?.headers).get("LinkedIn-Version")).toBe("202610");
    expect(new Headers(init?.headers).get("X-Restli-Protocol-Version")).toBe("2.0.0");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-token");
    expect(JSON.parse(String(init?.body))).toEqual({ author: "urn:li:person:person-1", commentary: content.text, visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] }, lifecycleState: "PUBLISHED", isReshareDisabledByAuthor: false });
    return created();
  };
  expect(await new LinkedInProvider(fetch).publish(content)).toEqual({ provider: "linkedin", response: { id: "urn:li:share:post-1" } });
});

test("LinkedIn escapes reserved commentary characters and accepts a person URN", async () => {
  const fetch: Fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    expect(body.commentary).toBe("Hello \\@friend \\(test\\) \\[link\\] \\#tag \\*bold\\*");
    expect(body.author).toBe("urn:li:person:person-1");
    return created();
  };
  await new LinkedInProvider(fetch).publish({ ...content, account: { ...content.account, accountId: "urn:li:person:person-1" }, text: "Hello @friend (test) [link] #tag *bold*" });
});

test("LinkedIn uploads an image via REST Images without GET permissions", async () => {
  const calls: string[] = [];
  const fetch: Fetch = async (url, init) => {
    calls.push(String(url));
    expect(init?.method).not.toBe("GET");
    if (calls.length === 1) {
      expect(url).toBe("https://api.linkedin.com/rest/images?action=initializeUpload");
      expect(JSON.parse(String(init?.body))).toEqual({ initializeUploadRequest: { owner: "urn:li:person:person-1" } });
      return Response.json({ value: { image: "urn:li:image:image-1", uploadUrl } });
    }
    if (calls.length === 2) {
      expect(url).toBe(uploadUrl);
      expect(init?.method).toBe("PUT");
      expect(await new Response(init?.body).arrayBuffer()).toEqual(new Uint8Array([1, 2, 3, 4]).buffer);
      return new Response(null, { status: 201 });
    }
    expect(JSON.parse(String(init?.body)).content).toEqual({ media: { id: "urn:li:image:image-1" } });
    return created();
  };
  await new LinkedInProvider(fetch).publish({ ...content, media: [media()] });
  expect(calls).toHaveLength(3);
});

test("LinkedIn creates organic MultiImage content with ordered image URNs", async () => {
  let image = 0;
  const fetch: Fetch = async (url, init) => {
    if (String(url).includes("initializeUpload")) return Response.json({ value: { image: `urn:li:image:${++image}`, uploadUrl } });
    if (init?.method === "PUT") { await new Response(init.body).arrayBuffer(); return new Response(null, { status: 201 }); }
    expect(JSON.parse(String(init?.body)).content).toEqual({ multiImage: { images: [{ id: "urn:li:image:1" }, { id: "urn:li:image:2" }] } });
    return created();
  };
  await new LinkedInProvider(fetch).publish({ ...content, media: [media(), media()] });
});

test("LinkedIn streams video parts, finalizes ordered ETags and waits for AVAILABLE", async () => {
  const data = new Uint8Array(80_000).buffer;
  const parts: number[] = [];
  const waits: number[] = [];
  let checks = 0;
  const fetch: Fetch = async (url, init) => {
    if (String(url).includes("initializeUpload")) {
      expect(JSON.parse(String(init?.body)).initializeUploadRequest).toMatchObject({ owner: "urn:li:person:person-1", fileSizeBytes: 80_000 });
      return Response.json({ value: { video: "urn:li:video:1", uploadToken: "upload-token", uploadInstructions: [{ uploadUrl: `${uploadUrl}/part0`, firstByte: 0, lastByte: 49_999 }, { uploadUrl: `${uploadUrl}/part1`, firstByte: 50_000, lastByte: 79_999 }] } });
    }
    if (init?.method === "PUT") {
      parts.push((await new Response(init.body).arrayBuffer()).byteLength);
      expect(new Headers(init.headers).has("Authorization")).toBe(false);
      return new Response(null, { status: 200, headers: { etag: `"etag-${parts.length}"` } });
    }
    if (String(url).includes("finalizeUpload")) {
      expect(JSON.parse(String(init?.body))).toEqual({ finalizeUploadRequest: { video: "urn:li:video:1", uploadToken: "upload-token", uploadedPartIds: ["etag-1", "etag-2"] } });
      return new Response(null, { status: 200 });
    }
    if (init?.method === "GET") return Response.json({ status: ++checks === 1 ? "PROCESSING" : "AVAILABLE" });
    expect(JSON.parse(String(init?.body)).content).toEqual({ media: { id: "urn:li:video:1" } });
    expect(checks).toBe(2);
    return created();
  };
  await new LinkedInProvider(fetch, { wait: async (ms) => { waits.push(ms); } }).publish({ ...content, media: [{
    async load() { throw new Error("Do not buffer video"); },
    async open() { return { stream: new Blob([data]).stream(), size: data.byteLength, contentType: "video/mp4" }; },
  }] });
  expect(parts).toEqual([50_000, 30_000]);
  expect(waits).toEqual([5000]);
});

test("LinkedIn validates formats, content and media combinations before uploading", async () => {
  const provider = new LinkedInProvider(async () => { throw new Error("Unexpected fetch"); });
  await expect(provider.publish({ ...content, text: "" })).rejects.toThrow("requires text or media");
  await expect(provider.publish({ ...content, text: "a".repeat(3001) })).rejects.toThrow("3000");
  await expect(provider.publish({ ...content, media: Array.from({ length: 21 }, () => media()) })).rejects.toThrow("at most 20");
  await expect(provider.publish({ ...content, media: [media("application/pdf")] })).rejects.toThrow("supports JPEG");
  await expect(provider.publish({ ...content, media: [media(), media("video/mp4")] })).rejects.toThrow("alone");
});

test("LinkedIn rejects untrusted upload URLs and malformed upload responses", async () => {
  for (const value of [{}, { image: "wrong-urn", uploadUrl }, { image: "urn:li:image:1", uploadUrl: "https://attacker.example/upload" }]) {
    let calls = 0;
    const fetch: Fetch = async () => { calls++; return Response.json({ value }); };
    await expect(new LinkedInProvider(fetch).publish({ ...content, media: [media()] })).rejects.toThrow("LinkedIn returned");
    expect(calls).toBe(1);
  }
});

test("LinkedIn HTTP errors preserve rate-limit delays without leaking raw errors", async () => {
  for (const status of [401, 403, 429, 500]) {
    const fetch: Fetch = async () => Response.json({ message: "secret-token" }, { status, headers: { "retry-after": "120" } });
    try { await new LinkedInProvider(fetch).publish(content); throw new Error("Expected rejection"); }
    catch (error) {
      expect(error).toBeInstanceOf(PublishError);
      expect((error as PublishError).message).not.toContain("secret-token");
      expect((error as PublishError).retryable).toBe(status >= 429);
      if (status === 429) expect((error as PublishError).retryAfterSeconds).toBe(120);
    }
  }
});

test("LinkedIn never marks a response without a post ID successful", async () => {
  await expect(new LinkedInProvider(async () => new Response(null, { status: 201 })).publish(content)).rejects.toThrow("created post ID");
});

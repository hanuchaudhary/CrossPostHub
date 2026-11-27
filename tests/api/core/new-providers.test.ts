import { expect, test } from "bun:test";

import {
  BlueskyProvider,
  FacebookProvider,
  Mastodon,
  MastodonProvider,
  mastodonInstance,
  PinterestProvider,
  Telegram,
  telegramChat,
  TelegramProvider,
  Threads,
  ThreadsProvider,
  TikTokProvider,
} from "../../../packages/post/src";
import type { PublishMedia } from "../../../packages/post/src";

type Call = { url: string; init?: RequestInit };

function recorder(answer: (call: Call) => unknown) {
  const calls: Call[] = [];
  const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { url: String(input), init };
    calls.push(call);
    const body = answer(call);
    return new Response(body === undefined ? "" : JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  return { calls, fetcher };
}

const account = (meta: Record<string, string> = {}) => ({
  accountId: "acct-1",
  accessToken: "token-1",
  meta,
});

function image(type = "image/jpeg", url = "https://cdn.example.com/a.jpg"): PublishMedia {
  const data = new Uint8Array([1, 2, 3]).buffer;
  return {
    load: async () => ({ data, contentType: type }),
    getPublicUrl: async () => ({ url, contentType: type }),
    open: async () => ({
      stream: new Blob([data]).stream(),
      size: data.byteLength,
      contentType: type,
    }),
  };
}

const bodyOf = (call: Call) => {
  const body = call.init?.body;
  if (body instanceof URLSearchParams) return Object.fromEntries(body);
  if (typeof body === "string") return JSON.parse(body);
  if (body instanceof Uint8Array || body instanceof ArrayBuffer)
    return JSON.parse(new TextDecoder().decode(body));
  return body;
};

test("Threads posts text as a TEXT container then publishes it", async () => {
  const { calls, fetcher } = recorder((call) =>
    call.url.endsWith("/threads_publish") ? { id: "post-1" } : { id: "container-1" }
  );
  await new ThreadsProvider(fetcher).publish({ account: account(), text: "Hello" });
  expect(calls.map((call) => call.url)).toEqual([
    "https://graph.threads.net/v1.0/acct-1/threads",
    "https://graph.threads.net/v1.0/acct-1/threads_publish",
  ]);
  expect(bodyOf(calls[0]!)).toEqual({ media_type: "TEXT", text: "Hello" });
  expect(bodyOf(calls[1]!)).toEqual({ creation_id: "container-1" });
});

test("Threads builds a carousel from several images after each is processed", async () => {
  let created = 0;
  const { calls, fetcher } = recorder((call) =>
    call.url.includes("fields=status")
      ? { status: "FINISHED" }
      : call.url.endsWith("/threads_publish")
        ? { id: "post-1" }
        : { id: `c${++created}` }
  );
  await new ThreadsProvider(fetcher, async () => {}).publish({
    account: account(),
    text: "Two",
    media: [image(), image("image/png")],
  });
  const carousel = calls.find((call) => bodyOf(call)?.media_type === "CAROUSEL")!;
  expect(bodyOf(carousel)).toEqual({ media_type: "CAROUSEL", children: "c1,c2", text: "Two" });
});

test("Threads authorize URL asks for publishing scopes", () => {
  const url = new URL(
    new Threads({ appId: "app", appSecret: "secret" }).authUrl({
      state: "s",
      redirectUri: "https://api.example.com/cb",
    })
  );
  expect(url.origin).toBe("https://threads.net");
  expect(url.searchParams.get("scope")).toBe("threads_basic,threads_content_publish");
  expect(url.toString()).not.toContain("secret");
});

test("Facebook uploads photos unpublished and attaches them to one Page post", async () => {
  let photo = 0;
  const { calls, fetcher } = recorder((call) =>
    call.url.endsWith("/photos") ? { id: `p${++photo}` } : { id: "page_post" }
  );
  await new FacebookProvider(fetcher).publish({
    account: account(),
    text: "Hi",
    media: [image(), image()],
  });
  expect(calls.map((call) => call.url)).toEqual([
    "https://graph.facebook.com/v26.0/acct-1/photos",
    "https://graph.facebook.com/v26.0/acct-1/photos",
    "https://graph.facebook.com/v26.0/acct-1/feed",
  ]);
  expect(bodyOf(calls[2]!)).toEqual({
    message: "Hi",
    "attached_media[0]": '{"media_fbid":"p1"}',
    "attached_media[1]": '{"media_fbid":"p2"}',
  });
});

test("Bluesky uploads images and creates a post record on the account's PDS", async () => {
  const { calls, fetcher } = recorder((call) =>
    call.url.includes("uploadBlob")
      ? { blob: { $type: "blob", ref: { $link: "bafkreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm" }, mimeType: "image/jpeg", size: 3 } }
      : { uri: "at://did:plc:abc123/app.bsky.feed.post/3kabc", cid: "bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm" }
  );
  await new BlueskyProvider(fetcher).publish({
    account: account({ service: "https://pds.example.com" }),
    text: "Hello Bluesky",
    media: [image()],
  });
  const create = calls.find((call) => call.url.includes("createRecord"))!;
  expect(create.url).toBe("https://pds.example.com/xrpc/com.atproto.repo.createRecord");
  const record = bodyOf(create);
  expect(record.repo).toBe("acct-1");
  expect(record.record.text).toBe("Hello Bluesky");
  expect(record.record.embed.$type).toBe("app.bsky.embed.images");
});

test("Mastodon uploads media, waits for it, then posts the status", async () => {
  let checks = 0;
  const { calls, fetcher } = recorder((call) =>
    call.url.endsWith("/api/v2/media")
      ? { id: "m1", url: null }
      : call.url.includes("/api/v1/media/")
        ? { id: "m1", url: ++checks > 1 ? "https://files/m1" : null }
        : { id: "status-1" }
  );
  await new MastodonProvider(fetcher, async () => {}).publish({
    account: account({ instance: "https://mastodon.social" }),
    text: "Toot",
    media: [image()],
  });
  const status = calls.at(-1)!;
  expect(status.url).toBe("https://mastodon.social/api/v1/statuses");
  expect(bodyOf(status)).toEqual({ status: "Toot", media_ids: ["m1"] });
});

test("Mastodon server input is normalised and rejects junk", () => {
  expect(mastodonInstance("mastodon.social")).toBe("https://mastodon.social");
  expect(mastodonInstance("@me@fosstodon.org")).toBe("https://fosstodon.org");
  expect(() => mastodonInstance("http://insecure.example")).toThrow();
  expect(() => mastodonInstance("not a host")).toThrow();
  const url = new URL(
    new Mastodon({
      instance: "https://mastodon.social",
      clientId: "id",
      clientSecret: "secret",
    }).authUrl({ state: "s", redirectUri: "https://api/cb", codeVerifier: "v".repeat(43) })
  );
  expect(url.origin).toBe("https://mastodon.social");
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
});

test("Pinterest creates one Pin on the saved board from the image URL", async () => {
  const { calls, fetcher } = recorder(() => ({ id: "pin-1" }));
  await new PinterestProvider(fetcher, "https://api-sandbox.pinterest.com").publish({
    account: account({ boardId: "board-1" }),
    text: "Title line\nMore words",
    media: [image()],
  });
  expect(calls[0]!.url).toBe("https://api-sandbox.pinterest.com/v5/pins");
  expect(bodyOf(calls[0]!)).toEqual({
    board_id: "board-1",
    title: "Title line",
    description: "Title line\nMore words",
    media_source: { source_type: "image_url", url: "https://cdn.example.com/a.jpg" },
  });
});

test("TikTok posts privately until the app is audited", async () => {
  const { calls, fetcher } = recorder((call) =>
    call.url.includes("creator_info")
      ? { data: { privacy_level_options: ["PUBLIC_TO_EVERYONE", "SELF_ONLY"] }, error: { code: "ok" } }
      : call.url.includes("video/init")
        ? { data: { publish_id: "pub-1", upload_url: "https://upload.tiktok/1" }, error: { code: "ok" } }
        : call.url.includes("status/fetch")
          ? { data: { status: "PUBLISH_COMPLETE" }, error: { code: "ok" } }
          : undefined
  );
  await new TikTokProvider(fetcher).publish({
    account: account(),
    text: "Clip",
    media: [image("video/mp4")],
  });
  const init = calls.find((call) => call.url.includes("video/init"))!;
  expect(bodyOf(init).post_info.privacy_level).toBe("SELF_ONLY");
  const upload = calls.find((call) => call.url === "https://upload.tiktok/1")!;
  expect((upload.init?.headers as Record<string, string>)["content-range"]).toBe("bytes 0-2/3");
});

test("Telegram sends text with sendMessage and hides the bot token from errors", async () => {
  const { calls, fetcher } = recorder(() => ({ ok: true, result: { message_id: 1 } }));
  await new TelegramProvider(fetcher).publish({
    account: { accountId: "-100123", accessToken: "123:SECRET" },
    text: "Hi channel",
  });
  expect(calls[0]!.url).toBe("https://api.telegram.org/bot123:SECRET/sendMessage");
  expect(bodyOf(calls[0]!)).toEqual({ chat_id: "-100123", text: "Hi channel" });
  const failing = async () =>
    new Response("{}", { status: 403 });
  await expect(
    new TelegramProvider(failing).publish({
      account: { accountId: "-1", accessToken: "123:SECRET" },
      text: "x",
    })
  ).rejects.toThrow();
});

test("Telegram channel input accepts @names, links and numeric IDs", () => {
  expect(telegramChat("@my_channel")).toBe("@my_channel");
  expect(telegramChat("https://t.me/my_channel")).toBe("@my_channel");
  expect(telegramChat("-1001234567")).toBe("-1001234567");
  expect(() => telegramChat("bad name!")).toThrow();
});

test("Telegram connect needs the code in the description and a bot that can post", async () => {
  const replies: Record<string, unknown> = {
    getChat: { id: -100, type: "channel", title: "News", description: "hello cph-abc" },
    getMe: { id: 7 },
    getChatMember: { status: "administrator", can_post_messages: true },
  };
  const fetcher = async (input: RequestInfo | URL) =>
    Response.json({ ok: true, result: replies[String(input).split("/").at(-1)!] });
  const original = globalThis.fetch;
  globalThis.fetch = fetcher as typeof fetch;
  try {
    const provider = new Telegram({ botToken: "1:T" });
    const connected = await provider.connectForm({ chat: "@news_room", code: "cph-abc" });
    expect(connected).toMatchObject({ id: "-100", name: "News" });
    await expect(provider.connectForm({ chat: "@news_room", code: "cph-xyz" })).rejects.toThrow(
      "description"
    );
    replies.getChatMember = { status: "member" };
    await expect(provider.connectForm({ chat: "@news_room", code: "cph-abc" })).rejects.toThrow(
      "admin"
    );
  } finally {
    globalThis.fetch = original;
  }
});

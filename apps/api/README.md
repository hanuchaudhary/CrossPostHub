# CrossPostHub API

Run `bun install` from the monorepo root, then `bun run dev` in this directory.
Run `bun run build` to generate Prisma and typecheck.

Backend tests live in the separate `@repo/tests` workspace at `../../tests/api`,
covering the API's providers, routes, middleware, queue, auth configuration, database
client factory, billing synchronization, and Worker entry point. From the
monorepo root, run `bun run test` for the test pipeline (including the API build),
or `bun run test:api` to run just the API suite. See the
[tests workspace README](../../tests/README.md) for details.

## Linking social accounts

Authenticated users can explicitly link a provider account whose email differs
from their CrossPostHub login (`account.accountLinking.allowDifferentEmails`).
The provider must still verify its email, and an account already linked to another
user remains protected. Linking does not replace the app user's email.

After changing auth configuration, start a fresh connection from the dashboard.
OAuth callback URLs are single-use: replaying one after a failed link can produce
`state_mismatch` because Better Auth has already consumed the state record.

## Publishing architecture

`src/core/index.ts` is the public entry point for the framework-independent
publishing core. `CrossPostHub` owns a provider registry and delegates `publish`
to classes implementing `CrossPostProvider`. Twitter, LinkedIn, and Instagram are included.

```ts
import {
  CrossPostHub,
  TwitterProvider,
  LinkedInProvider,
  InstagramProvider,
} from "./src/core";

const hub = new CrossPostHub([
  new TwitterProvider(),
  new LinkedInProvider(),
  new InstagramProvider(),
]);

const result = await hub.publish({
  provider: "twitter",
  account: { accessToken: "...", accountId: "..." },
  text: "Hello from CrossPostHub",
});
// result: { provider: "twitter", response: <original provider response> }
```

Pass credentials with each request so one instance can serve multiple users.
Provider constructors accept an optional fetch implementation for testing or
custom transports. Media is optional and uses lazy loaders:

```ts
await hub.publish({
  provider: "linkedin",
  account: { accessToken: "...", accountId: "..." },
  text: "An image post",
  media: [
    {
      async load() {
        return { data: imageBytes, contentType: "image/png" };
      },
    },
  ],
});
```

Each loader returns an `ArrayBuffer` and its content type. Twitter currently
rejects media; LinkedIn registers and uploads images before publishing.

### Instagram

`InstagramProvider` uses Instagram Login tokens against
`https://graph.instagram.com/v25.0`. Its constructor accepts the same optional
fetch transport as other providers, plus an options object with `apiVersion` and
an injectable `wait` function for processing checks.

It supports one JPEG image, a carousel of 2–10 JPEG images, or one MP4/MOV video
published as a Reel. Text becomes the caption; text-only posts, Stories, and video
carousels are currently unsupported. Each media item must implement
`getPublicUrl()` returning `{ url, contentType }`; the provider never downloads
media bytes. For example:

```ts
await hub.publish({
  provider: "instagram",
  account: {
    accessToken: instagramToken,
    accountId: instagramProfessionalAccountId,
  },
  text: "Hello Instagram",
  media: [
    {
      async load() {
        return { data: imageBytes, contentType: "image/jpeg" };
      },
      async getPublicUrl() {
        return {
          url: "https://cdn.example.com/photo.jpg",
          contentType: "image/jpeg",
        };
      },
    },
  ],
});
```

The provider creates containers, checks for `FINISHED` before publishing, and
polls pending containers once per minute for up to five minutes. Failed, expired,
or timed-out containers throw errors into the queue's existing retry flow. Queue
retries start a new publishing attempt; they do not resume an existing container.

For queued posts, configure `R2_PUBLIC_URL` to the public HTTPS bucket domain (or
CDN base URL). The worker reads R2 object metadata to supply the content type and
builds the public URL from the object key. Meta must be able to fetch those URLs
without authentication throughout processing. Upload JPEG files for image posts;
this integration does not convert PNG/WebP to JPEG.

Use an Instagram professional account ID and an Instagram Login access token
with `instagram_business_basic` and `instagram_business_content_publish` granted.
Facebook Login/Page tokens use a different API host and are not supported by
this provider. See [Meta's Instagram API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)
and [content publishing guide](https://developers.facebook.com/docs/instagram-platform/content-publishing/).

The API's Better Auth configuration does not yet offer Instagram OAuth account
linking. This change adds the publishing provider and queue registration; the
queue requires an existing `instagram` account record with its account ID and
publishing token. Standalone core callers can pass those credentials directly.

To add a provider, implement `CrossPostProvider` with a unique `name` and a
`publish(content)` method returning `PublishResult`, then register the instance
using the constructor or `hub.registerProvider(provider)`. Duplicate names and
unregistered providers throw errors. `hub.getProviders()` lists registered names.
Exposing a new provider through the API also requires updating the request
validation, `PostJob` provider union, and account connection configuration.

The HTTP posts route continues to validate requests, enforce plan limits, and
enqueue jobs. `src/queue.ts` connects stored account credentials and R2 media to
the core, and handles scheduling, retries, persistence, and notifications. Provider
errors propagate to that existing retry flow.

The core imports no Hono, Prisma, Cloudflare bindings, or environment variables.
It can later move into a workspace package by exporting `src/core/index.ts` and
updating the queue's import. This refactor does not publish a package.

## Deployment

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

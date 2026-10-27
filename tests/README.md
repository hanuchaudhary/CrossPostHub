# Workspace tests

`@repo/tests` is a private workspace package next to `apps/` and `packages/`.
All API service tests live here, under `api/`, rather than inside the deployed app.

From the monorepo root (`main/`):

```sh
bun install
bun run test       # Turborepo: API build, then tests
bun run test:api   # API tests directly
bun run --cwd tests check-types
```

The API build generates the Prisma client. For a fresh checkout, configure the
API's `DATABASE_URL` for Prisma generation (a placeholder local SQLite URL is
sufficient for generation); the tests themselves use no database credentials.
If generated files are absent, run `bun run build` in `apps/api` before running
the suite directly. The root test pipeline performs this step automatically.

To run one file, or inspect coverage:

```sh
cd tests
bun test ./api/routes/posts.test.ts
bun test ./api --coverage
```

| Area                     | Coverage                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/core/`              | Provider registration, Twitter and LinkedIn publishing, Instagram images/carousels/Reels, validation and upstream failures                                                      |
| `api/routes/`            | Every current route group: posts, media, notifications, payment, and user; authorization, validation, successful requests, user scoping, scheduling, quotas and upstream errors |
| `api/middleware.test.ts` | Error responses, CORS, Prisma context, session resolution and auth-route session bypass                                                                                         |
| `api/queue.test.ts`      | Provider dispatch, scheduling, retries, exhausted jobs, success notifications, duplicate-success skips, R2 adapters and batch isolation                                         |
| `api/lib/`               | Auth configuration, Prisma client caching, payment/subscription webhook synchronization and billing environment selection                                                       |
| `api/worker.test.ts`     | Health, missing routes, security headers, middleware composition, auth delegation and queue delegation                                                                          |

The suite uses Bun's test runner. Existing publishing tests use its `node:test`
compatibility; request and service tests use `bun:test` for spies and fixtures.
`api/support.ts` supplies test sessions, fail-fast database mocks, queue and R2
bindings, and a network guard. Spies are restored after each test. Do not enable
concurrent execution for tests that replace shared module functions or `fetch`.

These are unit and in-process HTTP tests. They exercise application handlers with
mocked persistence, authentication sessions and external services. They do not
verify live social publishing, real D1/R2, OAuth redirects, or webhook signature
verification inside Better Auth's billing plugin. Webhook sync tests start with
an already verified payload.

Add tests for additional API services under `api/`; both test commands discover
them automatically. Add tests for other apps in their own directory and update
this workspace's `test` script when those suites are introduced. The test task is
uncached so edits to imported API source always execute the suite.

# CrossPostHub web

React, TypeScript, Vite, React Router, Tailwind CSS v4, shadcn/Base UI, Hugeicons, Motion, Axios, and TanStack Query.

Run from the repository root:

```sh
bun install
bun run --cwd apps/web dev
bun run --cwd apps/web build
bun run --cwd apps/web lint
```

Set `VITE_API_URL` in `apps/web/.env.local` to the API origin (default `http://localhost:8787`, without `/api`). Start the existing API separately. Set its `CLIENT_URL` to this frontend's origin, normally `http://localhost:5173`, so Better Auth trusted origins, cookies, CORS, and OAuth redirects work. Do not mix `localhost` with `127.0.0.1`.

## Structure

- `src/router.tsx`: every route definition and protected route nesting.
- `src/lib/api.ts`: Axios instance, typed application requests, and Better Auth action exports. Better Auth uses its own official transport so its session cookie and reactive session handling stay intact.
- `src/lib/query.ts`: QueryClient, query/mutation keys, query options, and invalidation helpers.
- `src/lib/auth-client.ts`: Better Auth client and `useSession`.
- `src/components/ui`: reusable shadcn components. This resolves to `@/components/ui`, as configured by `components.json`. Keeping this directory makes registry imports and the feature block's utility paths work. No additional Tailwind, TypeScript, or shadcn initialization is required.
- `src/index.css`: Tailwind imports and the standard shadcn theme tokens/base layer only. All page layouts use Tailwind utilities; application animations use Motion with reduced-motion support.
- `src/components/ui/block-feature.tsx`: supplied six-feature layout. All seven referenced utility components are included locally. Hugeicons replaces Lucide and Tabler, following the requested icon system.

Public routes: `/`, `/signin`, `/register`, `/forgot-password`, `/verify`, `/reset-password`, `/privacy`, `/terms`, `/contact`.

Protected routes: `/dashboard`, `/posts`, `/create`, `/schedule`, `/settings`, `/profile`, `/notifications`, `/billing`.

The native shadcn Calendar uses local dates, loads all paginated posts, and opens the composer on a selected day. The composer validates connected channels and future scheduling dates, supports image uploads, and submits the API's multipart form. Published and failed statuses come from the API. Social account connections use the existing Twitter and LinkedIn providers; Instagram remains marked coming soon, matching the existing client.

## Backend setup still needed

Sign-in, sign-up, Google OAuth, profile updates, password changes, social connections, and sessions use the existing Better Auth server. Password-reset and verification pages call the official client methods, but the server currently has **no mail delivery callbacks**. Configure `emailAndPassword.sendResetPassword` and `emailVerification.sendVerificationEmail` in `apps/api/src/lib/auth.ts` with your email provider before these emails can be delivered. Configure verification requirements/send-on-signup according to your product policy. Callback destinations are `/reset-password` and `/dashboard`. See https://better-auth.com/docs/reference/options and https://better-auth.com/docs/concepts/email.

Pricing is deliberately client-side mock data in `components/landing/pricing.tsx`; changing the monthly/yearly toggle never fetches a database or starts payment. Billing shows the existing subscription read-only. Upgrades are not implemented. The legal pages are clearly marked drafts for operator review.

For static hosting, rewrite all non-asset paths to `index.html` so deep links and OAuth callbacks reach React Router. Use HTTPS for production and configure the API's cookie domain/SameSite policy for the deployment's frontend/API origins.

## UI conventions

Use the native shadcn components in `src/components/ui` for controls, badges, forms, navigation, calendars, and the workspace sidebar. Add missing components with `bunx shadcn add <component>` from `apps/web`. This project uses the Base UI Mira registry and Hugeicons. Use `render={<Link ... />}` with `nativeButton={false}` for buttons that navigate.

Keep styling in Tailwind utility classes. Do not add custom CSS selectors or keyframes. Use Motion for application animations. `public/logo.svg` is the application logo and favicon; `public/icons/*-icon.svg` supplies the social platform logos. The X asset uses Tailwind inversion to remain visible in both themes.

## Page organization

Each page has its own default-exported component file under `src/pages`. Auth pages live in `pages/auth/{signin,register,forgot,verify,reset}.tsx`; each owns its form and submit handler. Shared auth presentation lives in `components/auth`. Workspace pages are grouped into `pages/dashboard`, `pages/posts`, `pages/account`, and `pages/notifications`; informational pages live in `pages/legal`, `pages/contact`, and `pages/errors`. All route definitions remain in `src/router.tsx`.

Settings contains appearance, subscription details, and links to connection and privacy controls. Profile contains the avatar selector, name/email details, and a change-password form with current/new password only. The avatar list matches the supplied reference. All pages use plain Tailwind sections; do not introduce Card components. Social account connections remain available at `/connections`.

## Channels and types

`src/lib/constants.ts` is the channel catalog. Each entry has an ID, name, supplied SVG icon, and a required `locked` boolean. X and LinkedIn are unlocked; the remaining icons are visible with locks until their integrations are ready. Connections and composer selectors both use this catalog. Connections return to `/connections` after OAuth.

`src/lib/types.ts` centralizes the application models and shared prop types: channels, API payloads/responses, posts, sessions/accounts, notifications, subscriptions, avatars, profile/password changes, icons, themes, and floating input props. The publishing `Platform` type stays restricted to providers the existing API accepts.

Platform controls show only icons: connected channels use color; disconnected channels use grayscale; locked channels have a lock overlay and disabled controls. Click a connected icon to open its Disconnect menu. Locked channels are also rejected by the connection and publishing API helpers.

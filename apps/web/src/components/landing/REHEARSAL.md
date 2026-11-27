# Trust demo rehearsal

- **Component:** `trust-demo.tsx`, shown in the Trust section of the landing page.
- **Gold copied:** `share` (a list row, an anchored confirm popover, measured with `rect()`), framed as a satellite over a sidebar window like `static-card`.
- **Story (about 11s loop):** Disconnect on Instagram → confirm popover → the row turns "Not connected" with Connect, and the access card swaps the token for "Deleted from our servers" / Revoked → Connect restores it. The poster is the disconnected state.
- **Changed from the gold:** CrossPostHub's own tokens through `Stage tokens` (Inter, brand blue, app surfaces and radii). Styles are Tailwind classes only. Kit parts need `!` because the kit's `@layer stageshow` is declared after Tailwind's layers. Icons are Keyline duotone, at the product owner's request, which goes against craft.md's single-tone rule.
- **Compact (below 480px):** 358×340, no satellite. The Instagram subtitle carries "Access deleted".
- **Filmed:** the full loop at 1280 and 390 with `--gate`, and both passed. Kit-level notes remain: Swap "vanishes with no exit" and a 5px Swap width step at the confirm beat.
- **Not checked:** dark theme on film (the stage follows the app theme), Safari, and reduced motion beyond the poster.

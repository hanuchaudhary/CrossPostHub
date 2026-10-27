# Editor

The screenshot, code, and GitHub editors live here, with one independent Zustand store per feature in `stores/`. Shared controls, editor constants, canvas utilities, and draft persistence are colocated in this directory. Routes import the feature directly; generic UI primitives remain in `components/ui`.

The screenshot preview uses native Canvas 2D for images, gradients, borders, and window frames. Its backing pixels are independent of its CSS display size. Decoded images are cached, stale renders are discarded, and capture waits for the latest render.

Code and GitHub previews retain HTML for syntax highlighting and the contribution calendar. Their export path snapshots the DOM into SVG and draws it to a canvas at 2× resolution. All exports are transparent PNGs, limited to 8192 pixels per side and 16 million pixels to bound memory use. Remote images must allow cross-origin access. Browser storage limits still apply to image drafts.

Draft keys remain compatible with earlier versions. Uploaded backgrounds use data URLs so they remain available after a reload.

Run `bun run test:editor` from `client` for renderer and draft-storage tests.

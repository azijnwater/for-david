# For David — Sucuk Photo Archive

An editorial, animated portfolio for Sucuk: cat, professional sleeper, window specialist, and occasional host.

Live site: [buurtvader.vercel.app](https://buurtvader.vercel.app)

## Development

```bash
npm install
npm run dev
```

The project uses Next.js, TypeScript, Tailwind CSS, Motion, and Radix Dialog.

## Checks

```bash
npm run lint
npm run test:arcade
npm run build
```

## Birthday edition

The second-birthday edition celebrates November 2, 2026. It is enabled on every new page load. The accessible **Birthday mode** switch restores the everyday design and copy when turned off, and the birthday edition when turned back on. No preference is stored between visits.

The existing section order, ten-photo moving archive, lightbox, gallery pause control, and local visit planner are preserved. The corrected journal timeline begins in 2024. Birthday colors are independent of the everyday light/dark theme; the theme control returns in everyday mode. Reduced-motion preferences disable the moving gallery and confetti.

## Sucuk's arcade

The `#minigames` section contains twelve original cat-themed tributes: Yarn trail (Snake), Shelf demolition (Breakout), Paw pong (Pong), Feather patrol (Space Invaders), Flying floof (Flappy Bird), Midnight zoomies (endless runner), Treat rain (catch-and-dodge), Sofa safari (Frogger), Nap-time pairs (Concentration), Box inspector (Whac-A-Mole), Treats, squared (2048), and Lights out, Sucuk (Lights Out). No Flash files, copied artwork, external game embeds, or game accounts are used.

Games load when opened, support keyboard and touch controls, and share the site's birthday/everyday palettes. Action games pause when the tab is hidden or the window loses focus. Box inspector suspends its timer while the tab is hidden. Personal bests remain available on the device even if global storage is unavailable.

### Shared leaderboards

Connect a **private Vercel Blob store** to this project in Vercel's Storage tab. It must provide the server-only `BLOB_READ_WRITE_TOKEN` environment variable. Redeploy after connecting storage. Do not put the token in a `NEXT_PUBLIC_` variable or commit it. The token also signs short-lived game sessions; `ARCADE_SIGNING_SECRET` can optionally provide a separate signing key.

Each game keeps its top 100 submitted runs in `arcade-v1/<game>.json` and displays the top 20. Higher scores rank first, with earlier submissions winning ties. The API validates names, score ranges, plausible session duration, duplicate submissions, and a five-second per-visitor/game save cooldown. Blob conditional writes retry concurrent updates so scores aren't silently overwritten. An HMAC-derived visitor identifier supports the cooldown without persisting raw IP addresses. Session signatures and score bounds discourage basic spam; these are casual client-scored games, not cheat-proof competitive tournaments.

Names and scores are public. The UI explicitly says this before submission. Only names, scores, timestamps, run IDs, and short-lived cooldown metadata are stored; there is no login or email field. Storage errors are shown honestly and never replaced with fictional scores.

For local development without cloud storage, set `ARCADE_STORE_DIR` to an absolute directory outside the repository before running `npm run dev`. This **development-only** file adapter uses locked, atomic writes and is disabled in production. Unit tests use isolated temporary directories and do not touch live leaderboards.

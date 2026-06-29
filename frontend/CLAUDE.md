<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CLAUDE.md — Intoxicated Project

Context for Claude Code sessions on this repo. Read this first.

## Project

Countdown / interactive teaser website for a friend's poetry book **"Intoxicated"**, releasing **September 1st 2026**. Inspired by Drake's *Iceman* rollout site (built by Low Battery, Toronto). Goal: drop an atmospheric, gated experience leading up to release.

**Book vibe**: multiple acts, "shots after shots" pacing, toxic-relationships theme. Visual aesthetic = in-your-face, Chrome Hearts–style gothic typography, black + red palette. B&W opera hall / mansion staircase background on the homepage.

## Stack

- **Frontend**: Next.js 16 App Router + React 19 + TypeScript + Tailwind 4, `src/` directory, Turbopack, `@/*` import alias, **no** React Compiler
- **Backend**: TBD. Leaning Next.js route handlers over Flask for simplicity (deploys as one unit on Vercel). Reassess if the minigame needs Python.
- **Storage**: AWS S3 (private bucket + pre-signed URLs once gate 2 ships)
- **Lambda**: only if we end up needing image resize-on-upload
- **Deploy**: Vercel for frontend

## Repo layout

```
/
├── frontend/                         ← active dev
│   ├── public/
│   │   ├── fonts/
│   │   │   └── CloisterBlack.ttf     ← Chrome Hearts–style gothic font
│   │   └── images/
│   │       └── homepage-bg.jpg       ← B&W opera hall / mansion staircase
│   └── src/
│       ├── app/
│       │   ├── page.tsx              ← Gate 1 (matrix terminal password gate)
│       │   ├── layout.tsx            ← root layout, Geist Mono font, black bg
│       │   ├── globals.css           ← Tailwind 4, CloisterBlack @font-face, dark theme
│       │   └── home/
│       │       ├── layout.tsx        ← home layout, mounts CircleCursor for all /home/* pages
│       │       ├── page.tsx          ← homepage (countdown, parallax, floating nav)
│       │       ├── zine/page.tsx     ← magazine/zine viewer page
│       │       ├── jacket/           ← (planned) custom jacket page
│       │       └── game/             ← (planned) mini-game page
│       ├── components/
│       │   ├── MatrixRain.tsx        ← full-screen red matrix rain canvas
│       │   ├── Terminal.tsx          ← typewriter boot sequence + password input
│       │   ├── ZineViewer.tsx        ← 3D page-flip magazine viewer
│       │   └── CircleCursor.tsx      ← Destiny-style circle cursor (expands on hover)
│       └── lib/
│           └── auth.ts              ← plaintext password check ("itxc-2026")
├── backend/                          ← empty, may stay empty
└── .claude/
    └── launch.json                   ← dev server config for preview tool
```

## Status

### Done
- Next.js scaffolded with Tailwind 4, Turbopack, App Router
- **Gate 1** — matrix terminal at `/`:
  - Red matrix-rain canvas background (Japanese katakana + digits)
  - Typewriter boot sequence ("ITXC SYSTEM v2.06", connection/encryption/integrity checks)
  - Masked password input with "ENTER PASSWORD ▶" prompt
  - Plaintext password check — password is `itxc-2026` (case-insensitive, trimmed)
  - On success: `sessionStorage.gate1 = "open"`, redirect to `/home`
  - On fail: "ACCESS DENIED" flash, re-prompt
- **Homepage `/home`**:
  - B&W opera hall / mansion staircase background image with darken overlay + vignette
  - "ITXC" title in CloisterBlack (Chrome Hearts–style gothic font), red with glow
  - Countdown timer to Sept 1st 2026 in same gothic font, large and bold, red glow
  - DAYS / HRS / MIN / SEC labels in mono beneath each unit
  - **Parallax mouse tracking** — content and background shift inversely to cursor movement (ICEMAN-style), smooth eased interpolation
  - **Three floating nav buttons** at bottom: Zine (Digital Magazine), Jacket (Custom Piece), Game (Mini-Game) — frosted glass style with backdrop-blur, red gothic label + mono subtitle, hover effects
  - Auth guard: bounces to `/` if `sessionStorage.gate1` is not set
- **Custom circle cursor** (Destiny-style):
  - Small circle (16px) follows mouse with eased lag
  - Expands to 48px when hovering over buttons, links, or `[data-hover]` elements
  - Uses `mix-blend-difference` for visibility on any background
  - Mounted via `/home/layout.tsx` — appears on all `/home/*` pages, NOT on Gate 1
  - Native cursor hidden with `cursor-none` on all `/home/*` pages
- **Zine page `/home/zine`**:
  - 44-page magazine viewer with placeholder pages (ready for S3 images)
  - Desktop: two-page spread view (≥768px), single page on mobile
  - 3D book-like page-flip animation (CSS perspective + rotateY)
  - Drag/swipe to flip: pointer drag left = next, right = prev, with snap-or-revert threshold
  - PREV/NEXT buttons + keyboard arrows + spacebar navigation
  - Front/back face rendering during flip with dynamic shadow
  - Spine shadow between pages in spread view
  - VHS aesthetic: scanline overlay, noise grain, vignette on black background
  - Header: "← BACK" link to `/home` + "INTOXICATED ZINE" title in red
  - Auth guard: same as homepage

### Next (priority order)
1. **Jacket page `/home/jacket`** — custom ITXC jacket showcase/configurator. Design TBD.
2. **Mini-game page `/home/game`** — deferred, design TBD.
3. **Gate 2** — second puzzle, themed to *Intoxicated* (heavier than gate 1). Unlocks the magazine. Server-validated.
4. **Zine S3 integration** — swap placeholder pages for real images fetched from AWS S3 via pre-signed URLs. Lazy-load current + next 2 spreads.
5. **Homepage polish** — additional decorative elements, animations, responsive fine-tuning.
6. **Floating merch element** — CN Tower live-feed style, likely react-three-fiber.
7. **Hidden messages / easter eggs** — console.log, hover reveals, secret routes.

## Key decisions & tradeoffs

- **Gate 1 is client-side on purpose.** Password lives in `src/lib/auth.ts` as plaintext. The homepage isn't truly secret — it's an atmospheric door. Real secrets (the magazine) go behind server-validated gate 2.
- **No hashing on gate 1.** SHA-256 was originally used but removed — adds complexity without real security since it's client-side.
- **Custom page-flip over react-pageflip.** Built a custom 3D flip with CSS transforms + pointer events — no extra dependency, full control over animation and drag behavior.
- **CloisterBlack font for Chrome Hearts aesthetic.** Loaded via `@font-face` in `globals.css`, available as `font-gothic` Tailwind class. From fontyfonts.com (free with attribution for commercial use).
- **Parallax is mouse-only.** On mobile/touch, the parallax offset stays at 0 (no `mousemove` events). This is intentional — touch parallax via gyroscope is a future consideration.
- **Circle cursor mounted at `/home/layout.tsx`** so it appears on all authenticated pages but NOT on the Gate 1 password page, where the terminal aesthetic uses its own cursor style.
- **Release date is Sept 1st 2026** — hardcoded in `home/page.tsx` as `RELEASE_DATE`. Change there when the date firms up.
- **Image protection plan**: private S3 bucket + pre-signed URLs with short TTL, re-signed as the user flips.
- **No DRM.** Can't prevent screenshots, won't try.

## Conventions

- `"use client"` only where needed (interactivity, browser APIs)
- Components → `src/components/`
- Shared logic / hooks → `src/lib/`
- Routes → `src/app/`
- Path alias `@/*` → `src/*`
- `font-gothic` = CloisterBlack (Chrome Hearts alt) — used on `/home` and downstream for titles/countdown
- `font-mono` = Geist Mono — used for terminal UI, labels, body text
- Tailwind for styling unless something truly needs a CSS module
- VHS texture (scanlines + grain + vignette) on zine page; matrix rain on gate 1
- `cursor-none` + CircleCursor on all `/home/*` pages

## References

- Drake's *Iceman* site by Low Battery (Toronto agency) — overall blueprint, parallax mouse tracking
- *Iceman* zine: 44 hidden-message images → direct format inspo for our zine
- Destiny / Destiny 2 UI — circle cursor that expands on interactive elements
- "Iceman / Low Battery" aesthetic for floating merch element

## Notes for future sessions

- **Keep this file updated as decisions land.** Especially: backend choice, fonts chosen, deploy target firmed up, release date changes, new pages added.
- The friend's first book is the source for gate 1's missing-word puzzle. Gate 2 should pull from *Intoxicated* itself.
- When patterns worth saving emerge (pre-signed URL flow, password gating, page-flip lazy-load), suggest a wiki entry for the Obsidian LLM wiki.
- Do not commit the password to a public repo if the puzzle answer is sensitive. For gate 1 it's fine; for gate 2 the secret lives server-side only.
- The zine viewer uses `sessionStorage` for auth — refreshing the zine page will bounce back to `/` since sessionStorage persists per tab but the gate check runs on mount.
- The CircleCursor uses `mix-blend-difference` — it inverts colors underneath. On pure black backgrounds the cursor border may be invisible; consider adding a subtle background tint if this becomes an issue.

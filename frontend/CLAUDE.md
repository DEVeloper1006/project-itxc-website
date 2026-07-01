<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CLAUDE.md — Intoxicated Project

Context for Claude Code sessions on this repo. Read this first.

## Project

Countdown / interactive teaser website for a friend's poetry book **"Intoxicated"**, releasing **September 18th 2026**. Inspired by Drake's *Iceman* rollout site (built by Low Battery, Toronto). Goal: drop an atmospheric, gated experience leading up to release.

**Book vibe**: multiple acts, "shots after shots" pacing, toxic-relationships theme. Visual aesthetic = in-your-face, Chrome Hearts–style gothic typography, black + red palette. B&W opera hall / mansion staircase background on the homepage.

## Stack

- **Frontend**: Next.js 16 App Router + React 19 + TypeScript + Tailwind 4, `src/` directory, Turbopack, `@/*` import alias, **no** React Compiler
- **Backend**: Next.js route handlers (deployed as one unit on Vercel)
- **Storage**: Upstash Redis (via Vercel integration) for giveaway entries
- **Deploy**: Vercel (production)

## Repo layout

```
/
├── frontend/                         ← active dev
│   ├── public/
│   │   ├── fonts/
│   │   │   └── CloisterBlack.ttf     ← Chrome Hearts–style gothic font
│   │   └── images/
│   │       ├── homepage-bg.jpg       ← B&W opera hall / mansion staircase
│   │       ├── icon.jpg              ← site favicon
│   │       ├── jacket/               ← jacket giveaway preview images
│   │       └── zine/                 ← 64 zine page images
│   └── src/
│       ├── app/
│       │   ├── page.tsx              ← Gate 1 (matrix terminal password gate)
│       │   ├── layout.tsx            ← root layout, Geist Mono font, black bg
│       │   ├── globals.css           ← Tailwind 4, CloisterBlack @font-face, dark theme
│       │   ├── icon.jpg              ← favicon (Next.js convention)
│       │   ├── api/
│       │   │   └── giveaway/
│       │   │       ├── route.ts      ← POST: store giveaway entry in Redis
│       │   │       └── winner/
│       │   │           └── route.ts  ← GET: check winner + all entries
│       │   └── home/
│       │       ├── layout.tsx        ← home layout, mounts CircleCursor + ThemeProvider
│       │       ├── page.tsx          ← homepage (countdown, parallax, floating nav, jacket modal)
│       │       └── zine/page.tsx     ← magazine/zine viewer page
│       ├── components/
│       │   ├── MatrixRain.tsx        ← full-screen red matrix rain canvas
│       │   ├── Terminal.tsx          ← typewriter boot sequence + password input
│       │   ├── ZineViewer.tsx        ← 3D page-flip magazine viewer
│       │   ├── CircleCursor.tsx      ← Destiny-style circle cursor (desktop only, ≥1280px)
│       │   ├── ColorPicker.tsx       ← accent color selector (persists in sessionStorage)
│       │   ├── JacketModal.tsx       ← jacket giveaway popup (email → riddle → submit)
│       │   ├── PreviewScroller.tsx   ← auto-scrolling image preview for nav buttons
│       │   ├── FlashOverlay.tsx      ← flash image overlay (desktop only)
│       │   ├── KrisFlash.tsx         ← Kris flash overlay (desktop only)
│       │   ├── StatuesFlash.tsx      ← statues flash overlay (desktop only)
│       │   ├── EyesFlash.tsx         ← eyes flash overlay (desktop only)
│       │   ├── RedParticles.tsx      ← matrix-style red particle rain (desktop only)
│       │   └── LoadingScreen.tsx     ← animated loading screen
│       └── lib/
│           ├── auth.ts              ← plaintext password check ("itxc-2026")
│           └── theme.ts             ← React Context + CSS custom properties for accent color
└── .claude/
    └── launch.json                   ← dev server config for preview tool
```

## Status

### Done
- Next.js scaffolded with Tailwind 4, Turbopack, App Router
- **Deployed on Vercel** with Upstash Redis integration
- **Gate 1** — matrix terminal at `/`:
  - Red matrix-rain canvas background (Japanese katakana + digits)
  - Typewriter boot sequence ("ITXC SYSTEM v2.06", connection/encryption/integrity checks)
  - Masked password input with "ENTER PASSWORD ▶" prompt
  - Plaintext password check — password is `itxc-2026` (case-insensitive, trimmed)
  - On success: `sessionStorage.gate1 = "open"`, redirect to `/home`
  - On fail: "ACCESS DENIED" flash, re-prompt
- **Homepage `/home`**:
  - B&W opera hall / mansion staircase background image with darken overlay + vignette
  - "INTOXICATED" title in CloisterBlack (Chrome Hearts–style gothic font) with glow
  - Countdown timer to Sept 18th 2026 in same gothic font, large and bold
  - DAYS / HRS / MIN / SEC labels in mono beneath each unit
  - "COMING SOON" box above the title (desktop: absolute positioned with parallax, mobile: in-flow)
  - **Parallax mouse tracking** (desktop only, ≥1280px) — content and background shift inversely to cursor movement
  - **Color picker** — user can change the accent color; persists in sessionStorage, resets on reload
  - **Three floating nav buttons**: Zine (Digital Magazine), Jacket (Giveaway), Know Your Worth (Previous Book)
    - PreviewScroller with auto-scrolling images on Zine and Jacket buttons
    - Zine previews randomize from all 64 pages on each load
  - **Flash overlays** (desktop only): FlashOverlay, KrisFlash, StatuesFlash, EyesFlash — atmospheric image flashes
  - **Red particles** (desktop only): matrix-style falling characters
  - Auth guard: bounces to `/` if `sessionStorage.gate1` is not set
  - **Fully responsive**: separate mobile/tablet layout (stacked, scrollable, no animations) vs desktop (absolute positioned, parallax, all effects)
  - Breakpoint: `xl` (1280px) — everything below is mobile/tablet layout
- **Custom circle cursor** (Destiny-style, desktop only ≥1280px):
  - Small circle follows mouse with eased lag
  - Expands when hovering over interactive elements
  - Uses `mix-blend-difference` for visibility
  - Hidden on mobile/tablet — default cursor/touch behavior preserved
- **Zine page `/home/zine`**:
  - 64-page magazine viewer
  - Desktop: two-page spread view (≥768px), single page on mobile
  - 3D book-like page-flip animation (CSS perspective + rotateY)
  - Drag/swipe to flip with snap-or-revert threshold
  - PREV/NEXT buttons + keyboard arrows + spacebar navigation
  - VHS aesthetic: scanline overlay, noise grain, vignette
  - Title in Chrome Hearts gothic font
  - Auth guard: same as homepage
- **Jacket Giveaway** (modal popup from homepage):
  - Multi-step flow: email input (with validation) → 6-character PIN riddle → auto-submit
  - Entries stored in Upstash Redis with timestamp
  - First correct solver sees "You Won The Jacket", subsequent solvers see "The jacket has already been claimed"
  - `/api/giveaway/winner` GET endpoint to check winner + all entries
  - Animated entrance/exit, shake on wrong answer, loading spinner
  - Riddle answer is placeholder `XXXXXX` — update in `JacketModal.tsx:85` when real riddle is set

### Next (priority order)
1. **FNAF 2–style mini-game** — sprite-based horror mini-game exploring the dark lore behind the book and magazine. Will replace the "COMING SOON" box on the homepage. Inspired by Five Nights at Freddy's 2 gameplay style. Design TBD.
2. **Gate 2** — second puzzle, themed to *Intoxicated* (heavier than gate 1). Unlocks the magazine. Server-validated.
3. **Homepage polish** — additional decorative elements, animations, responsive fine-tuning.
4. **Hidden messages / easter eggs** — console.log, hover reveals, secret routes.

## Key decisions & tradeoffs

- **Gate 1 is client-side on purpose.** Password lives in `src/lib/auth.ts` as plaintext. The homepage isn't truly secret — it's an atmospheric door. Real secrets (the magazine) go behind server-validated gate 2.
- **Custom page-flip over react-pageflip.** Built a custom 3D flip with CSS transforms + pointer events — no extra dependency, full control over animation and drag behavior.
- **CloisterBlack font for Chrome Hearts aesthetic.** Loaded via `@font-face` in `globals.css`, available as `font-gothic` Tailwind class.
- **Parallax and animations are desktop-only (≥1280px).** On mobile/touch, parallax returns `{0,0}`, flash overlays and particles are hidden. Clean mobile experience.
- **Circle cursor desktop-only.** Hidden below 1280px so mobile/tablet get native touch behavior. `cursor-none` CSS rule scoped via `@media (min-width: 1280px)`.
- **Release date is Sept 18th 2026** — hardcoded in `home/page.tsx` as `RELEASE_DATE`.
- **Upstash Redis for giveaway** — stores entries with timestamps, first entry = winner. Env vars auto-injected by Vercel integration (`UPSTASH_REDIS_KV_REST_API_URL`, `UPSTASH_REDIS_KV_REST_API_TOKEN`).
- **No DRM.** Can't prevent screenshots, won't try.

## Conventions

- `"use client"` only where needed (interactivity, browser APIs)
- Components → `src/components/`
- Shared logic / hooks → `src/lib/`
- Routes → `src/app/`
- Path alias `@/*` → `src/*`
- `font-gothic` = CloisterBlack (Chrome Hearts alt) — used for titles, countdown, nav labels
- `font-mono` = Geist Mono — used for terminal UI, labels, body text
- Tailwind for styling unless something truly needs a CSS module
- VHS texture (scanlines + grain + vignette) on zine page; matrix rain on gate 1
- `cursor-none` + CircleCursor on `/home/*` pages (desktop only)
- Responsive breakpoint: `xl` (1280px) separates mobile/tablet from desktop layout
- All animations and effects disabled below 1280px

## References

- Drake's *Iceman* site by Low Battery (Toronto agency) — overall blueprint, parallax mouse tracking
- *Iceman* zine — format inspo for our zine viewer
- Destiny / Destiny 2 UI — circle cursor that expands on interactive elements
- Five Nights at Freddy's 2 — gameplay style inspo for the upcoming mini-game

## Notes for future sessions

- **Keep this file updated as decisions land.**
- The friend's first book (*Know Your Worth*) is the source for gate 1's password. Gate 2 should pull from *Intoxicated* itself.
- Do not commit the password to a public repo if the puzzle answer is sensitive. For gate 1 it's fine; for gate 2 the secret lives server-side only.
- The zine viewer uses `sessionStorage` for auth — refreshing bounces back to `/`.
- The CircleCursor uses `mix-blend-difference` — it inverts colors underneath. On pure black backgrounds the cursor border may be invisible.
- Giveaway riddle answer is placeholder `XXXXXX` — must be updated before the party/launch.
- To check giveaway winner: visit `/api/giveaway/winner` on the deployed site.
- To clear test entries: Vercel dashboard → Storage → itxc-redis → Open in Upstash → Data Browser → delete `giveaway:entries` key.

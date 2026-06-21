<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CLAUDE.md — Intoxicated Project

Context for Claude Code sessions on this repo. Read this first.

## Project

Countdown / interactive teaser website for a friend's poetry book **"Intoxicated"**, releasing July–August 2026. Inspired by Drake's *Iceman* rollout site (built by Low Battery, Toronto). Goal: drop an atmospheric, gated experience leading up to release.

**Book vibe**: multiple acts, "shots after shots" pacing, toxic-relationships theme. Visual aesthetic = in-your-face, Chrome Hearts–style gothic typography, black + red palette. Empty opera hall background on the homepage.

## Stack

- **Frontend**: Next.js 15 App Router + React + TypeScript + Tailwind, `src/` directory, Turbopack, `@/*` import alias, **no** React Compiler
- **Backend**: TBD. Leaning Next.js route handlers over Flask for simplicity (deploys as one unit on Vercel). Reassess if the minigame needs Python.
- **Storage**: AWS S3 (private bucket + pre-signed URLs once gate 2 ships)
- **Lambda**: only if we end up needing image resize-on-upload
- **Deploy**: Vercel for frontend

## Repo layout

```
/
├── frontend/                    ← active dev
│   └── src/
│       ├── app/
│       │   ├── page.tsx         ← gate 1 (matrix terminal)
│       │   ├── home/page.tsx    ← main page (WIP)
│       │   └── layout.tsx
│       ├── components/
│       │   ├── MatrixRain.tsx
│       │   └── Terminal.tsx
│       └── lib/
│           └── auth.ts          ← SHA-256 password check
└── backend/                     ← empty, may stay empty
```

## Status

### Done
- Next.js scaffolded with the options above
- **Gate 1** (matrix terminal at `/`):
  - Red matrix-rain canvas background (Japanese kana + digits)
  - Typewriter prompt → masked password input
  - Client-side SHA-256 check via Web Crypto API
  - On success: `sessionStorage.gate1 = "open"`, redirect to `/home`
  - On fail: flash + "access denied" line
- Placeholder `/home` that bounces unauthorized visitors back to `/`

### Next (priority order)
1. **Homepage `/home`** — black-and-white empty opera hall background, countdown in Chrome Hearts–style font (red), hyperlinks to zine / minigame / Instagram / etc.
2. **Gate 2** — second puzzle, themed to *Intoxicated* (heavier than gate 1). Unlocks the magazine. Server-validated.
3. **Magazine** — 44 images, page-flip via `react-pageflip`, lazy-load current + next 2 spreads, mobile fallback to vertical swipe under ~700px.
4. **Minigame** — deferred, design TBD.
5. **Floating merch element** — CN Tower live-feed style, likely react-three-fiber.
6. **Hidden messages / easter eggs** — console.log, hover reveals, secret routes.

## Key decisions & tradeoffs

- **Gate 1 is client-side on purpose.** Hash lives in `src/lib/auth.ts`. The homepage isn't truly secret — it's an atmospheric door. Real secrets (the magazine) go behind server-validated gate 2.
- **Chrome Hearts proper font is proprietary.** Substitutes: UnifrakturMaguntia, MedievalSharp, Cloister Black (paid). Body pairing TBD — likely brutalist sans.
- **Countdown date is config-driven** (release not finalized, July–Aug target). Env var or config file.
- **Image protection plan**: private S3 bucket + pre-signed URLs with short TTL, re-signed as the user flips. Don't ship the magazine to the client without server gate.
- **No DRM.** Can't prevent screenshots, won't try.

## Conventions

- `"use client"` only where needed (interactivity, browser APIs)
- Components → `src/components/`
- Shared logic / hooks → `src/lib/`
- Routes → `src/app/`
- Path alias `@/*` → `src/*`
- Mono font for terminal/hacker UI; Chrome Hearts–alt only on `/home` and downstream
- Tailwind for styling unless something truly needs a CSS module

## References

- Drake's *Iceman* site by Low Battery (Toronto agency) — overall blueprint
- *Iceman* zine: 44 hidden-message images → direct format inspo for our zine
- "Iceman / Low Battery" aesthetic for floating merch element

## Notes for future sessions

- **Keep this file updated as decisions land.** Especially: backend choice, fonts chosen, deploy target firmed up, release date when set, font files added.
- The friend's first book is the source for gate 1's missing-word puzzle. Gate 2 should pull from *Intoxicated* itself.
- When patterns worth saving emerge (pre-signed URL flow, password gating, page-flip lazy-load), suggest a wiki entry for the Obsidian LLM wiki — `raw/` for source, `wiki/` for the synthesized page.
- Do not commit the password hash to a public repo if the puzzle answer is sensitive. For gate 1 it's fine; for gate 2 the secret lives server-side only.
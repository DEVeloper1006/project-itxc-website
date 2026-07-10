# Intoxicated

Countdown and interactive teaser website for **"Intoxicated"** — a poetry book by Kris Gandhi, releasing September 18th, 2026.

Inspired by Drake's *Iceman* rollout site by Low Battery (Toronto).

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind 4
- **Upstash Redis** for giveaway entry storage
- **Vercel** for deployment

## Features

- **Matrix terminal gate** — red matrix rain + typewriter boot sequence + password input to enter the site
- **Atmospheric homepage** — parallax mouse tracking, gothic typography, countdown timer, floating navigation
- **64-page digital zine** — 3D page-flip viewer with drag/swipe, VHS scanline aesthetic
- **Jacket giveaway** — email collection + riddle challenge, first correct solver wins
- **Custom circle cursor** — Destiny-style cursor that expands on interactive elements (desktop only)
- **Flash overlays** — atmospheric image flashes with staggered copies and blend modes
- **Fully responsive** — desktop gets parallax, particles, and effects; mobile/tablet gets a clean stacked layout

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

For the jacket giveaway to work, set these in `.env.local`:

```
UPSTASH_REDIS_KV_REST_API_URL=<your-upstash-url>
UPSTASH_REDIS_KV_REST_API_TOKEN=<your-upstash-token>
```

These are auto-injected when using the Vercel + Upstash integration.

## Project Structure

```
frontend/
├── public/
│   ├── fonts/CloisterBlack.ttf    # Chrome Hearts-style gothic font
│   └── images/                    # All visual assets (zine pages, jacket photos, etc.)
└── src/
    ├── app/
    │   ├── page.tsx               # Gate 1 (matrix terminal)
    │   ├── home/page.tsx          # Homepage (countdown, nav, effects)
    │   ├── home/zine/page.tsx     # Zine viewer
    │   └── api/giveaway/          # Giveaway API routes
    ├── components/                # All UI components
    └── lib/                       # Auth, theme context
```

## Deployment

Deployed on Vercel with the `frontend/` directory as the root. Upstash Redis is connected via Vercel's integration dashboard.

## License

Private project. All rights reserved.

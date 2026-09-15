# Zuri Next

Glanceable live nearby Zurich departures PWA. GPS to nearest stops to next buses/trams/trains. Not a journey planner.

## Phase 1 MVP

PnPM monorepo:

- `packages/core` — transport.opendata.ch client, types, nearest stops, stationboard, TTL cache, favourites helpers, refresh policy, Zurich campus presets. **Zero React/UI deps.**
- `apps/web` — Vite + React + TypeScript PWA. Thin UI calling core only. Dark, mobile-first.

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173. Dev uses a Vite proxy (`/transport` → `https://transport.opendata.ch`) so browser CORS is not an issue on localhost.

Production build:

```bash
pnpm build
pnpm preview
```

Prod calls `https://transport.opendata.ch/v1` directly (API sends `Access-Control-Allow-Origin: *`).

## Deploy

### Vercel

`vercel.json` is set: framework null, `pnpm install` / `pnpm build`, output `apps/web/dist`.

### Cloudflare Pages

- Framework preset: **None**
- Build command: `pnpm build`
- Output directory: `apps/web/dist`
- Node version: 18+ (set `NODE_VERSION=20` if needed)

## API notes

- Base: https://transport.opendata.ch/v1
- Nearby: `/locations?x=&y=&type=station`
- Departures: `/stationboard?station=&limit=`
- **Rate limits:** the public transport.opendata.ch API is shared and rate-limited. Prefer sensible refresh (~45s), cache responses, and avoid hammering on every render. Heavy traffic may get throttled or temporary errors.
- **eLink:** the ETH-only free shuttle appears in the public feed as **line E** (category `B`, operator **VBG**), shown in the UI as **eLink**. Common stops: Zürich Haldenegg, ETH/Universitätsspital, ETH Hönggerberg. This app uses only transport.opendata.ch (no paid APIs); if the feed is incomplete, ETH publishes a PDF timetable backup at [ethz.ch staffnet mobility](https://ethz.ch/staffnet/en/service-and-administration/finance-and-controlling/mobility.html). Delay fields may be missing or approximate depending on the feed.

## Features

- Geolocation or campus chip presets (ETH Zentrum, Haldenegg, ETH/Uni, Hönggerberg, HB, Bellevue)
- Nearest stops with tunable radius (default ~700 m)
- Departures: line (eLink badge for ETH line E / VBG), destination, countdown, delay when present; eLink boosted near top of the board
- Manual refresh + auto-refresh ~45 s while the tab is visible
- Pin / favourite stops in `localStorage`
- Dark theme, PWA manifest (A2HS)

## Phase 2 (planned)

Expo / React Native app and home-screen widget sharing `@zuri-next/core` (same fetch, cache, favourites, refresh policy). No paid services required for Phase 1.

## License

Private / personal use unless otherwise noted.

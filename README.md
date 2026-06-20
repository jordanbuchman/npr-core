# How NPRcore are you?

[![CI](https://github.com/jordanbuchman/npr-core/actions/workflows/ci.yml/badge.svg)](https://github.com/jordanbuchman/npr-core/actions/workflows/ci.yml)

A small [Nuxt 4](https://nuxt.com) app that logs you in with Spotify, compares your top tracks and artists against NPR Music's best-albums lists, scores how "NPRcore" your taste is, and renders a downloadable results graphic.

**Stack:** Nuxt 4 · Vue 3 (`<script setup>` + TypeScript) · [Nuxt UI](https://ui.nuxt.com) (Tailwind CSS v4) · [fabric.js](http://fabricjs.com) (canvas graphic) · Spotify Web API (`spotify-web-api-ts-edge`) · Google Analytics (`nuxt-gtag`).

## Prerequisites

- **Node 22** (see [`.nvmrc`](.nvmrc) — run `nvm use`)
- A [Spotify app](https://developer.spotify.com/dashboard) for the login flow (see below)

## Setup

```bash
npm install
cp .env.example .env   # then fill in your values
```

### Environment variables

Auth uses the **Authorization Code + PKCE** flow, so no client secret is required. All values are public (`NUXT_PUBLIC_*`) and may be set at build time or, with the server build, at runtime.

| Variable                           | Description                                                    |
| ---------------------------------- | -------------------------------------------------------------- |
| `NUXT_PUBLIC_SPOTIFY_CLIENT_ID`    | Spotify app client ID (a default is baked in for convenience). |
| `NUXT_PUBLIC_SPOTIFY_REDIRECT_URI` | OAuth redirect URI. Empty → falls back to `${origin}/spotify`. |
| `NUXT_PUBLIC_GTAG_ID`              | GA4 measurement ID. Leave empty to disable analytics.          |

### Spotify dashboard

In your Spotify app settings, add a **Redirect URI** that points at the `/spotify` route of wherever the app runs, e.g. `http://localhost:3000/spotify` for local dev. It must match `NUXT_PUBLIC_SPOTIFY_REDIRECT_URI` (or `${origin}/spotify`) exactly.

## Development

```bash
npm run dev          # dev server with HMR at http://localhost:3000
```

## Quality checks

```bash
npm run lint         # ESLint (flat config via @nuxt/eslint)
npm run lint:fix     # auto-fix lint issues
npm run typecheck    # vue-tsc type checking
npm run test         # Vitest (unit + Nuxt component tests)
npm run test:watch   # Vitest in watch mode
```

A pre-commit hook (husky + lint-staged) runs ESLint and Prettier on staged files. CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint, typecheck, test, and build on every push and pull request.

## Production

```bash
npm run build        # Node server build  → .output/server (run: node .output/server/index.mjs)
npm run preview      # preview the server build locally
npm run generate     # static build       → .output/public (deploy to any static host)
```

Because all data fetching happens in the browser, the app works as a fully static site (`npm run generate`). The **server build** (`npm run build`) is preferred when you want to inject `NUXT_PUBLIC_*` env vars at runtime instead of baking them in at build time.

## Docker

The image builds the Node server output and reads `NUXT_PUBLIC_*` vars at runtime.

```bash
# With Docker Compose (reads variables from your local .env):
docker compose up --build      # → http://localhost:3000

# Or plain Docker:
docker build -t npr-core .
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify \
  npr-core
```

## Project structure

```
app/
  app.vue              # root: <UApp> + global SEO
  layouts/default.vue  # page chrome + footer
  pages/
    index.vue          # Spotify login (PKCE)
    spotify.vue        # OAuth callback + results tabs
  components/
    NprTitle.vue       # shared heading
    Results.vue        # matched tracks/artists, score, verdict
    Graphic.client.vue # fabric.js results graphic (client-only)
  composables/
    useSpotifyAuth.ts  # PKCE login + token exchange
    useNprMatches.ts   # fetch top music, match against NPR data, score
  utils/score.ts       # pure scoring/verdict helpers (unit-tested)
  types/npr.ts         # shared types
public/
  npr_data.json        # NPR best-albums dataset (fetched client-side)
  images/              # logo + social card
test/                  # Vitest specs
```

## License

[GPLv3](https://opensource.org/licenses/GPL-3.0). NPR and the NPR logo are property of [National Public Radio, Inc.](https://npr.org)

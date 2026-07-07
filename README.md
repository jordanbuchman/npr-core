# How NPRcore are you?

[![CI](https://github.com/jordanbuchman/npr-core/actions/workflows/ci.yml/badge.svg)](https://github.com/jordanbuchman/npr-core/actions/workflows/ci.yml)

A small [Nuxt 4](https://nuxt.com) app that logs you in with Spotify, compares your top tracks and artists against NPR Music's year-end best-of lists, scores how "NPRcore" your taste is, and renders a downloadable results graphic.

**Stack:** Nuxt 4 · Vue 3 (`<script setup>` + TypeScript) · [Nuxt UI](https://ui.nuxt.com) (Tailwind CSS v4) · [fabric.js](http://fabricjs.com) (canvas graphic) · Spotify Web API (`spotify-web-api-ts-edge`) · Google Analytics (`nuxt-gtag`).

## Run it (Docker)

Docker is the primary way to run the app — the image builds the Node server and reads
`NUXT_PUBLIC_*` variables at runtime. You need [Docker](https://docs.docker.com/get-docker/) and your
own [Spotify app](#spotify-setup).

```bash
cp .env.example .env          # then set your Spotify client ID (see Spotify setup)
docker compose up --build
```

Then open **`http://127.0.0.1:3000`** (not `localhost` — Spotify requires the loopback IP in the
redirect URI). Compose reads `NUXT_PUBLIC_*` from your local `.env`.

<details>
<summary>Plain Docker (without Compose)</summary>

```bash
docker build -t npr-core .
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_SPOTIFY_CLIENT_ID=<your client id> \
  -e NUXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/spotify \
  npr-core
```

</details>

## Spotify setup

Create your **own** app at the [Spotify dashboard](https://developer.spotify.com/dashboard) (the
built-in default client ID belongs to someone else's app and won't accept your redirect URI). Then:

1. Add a **Redirect URI** ending in `/spotify` that matches `NUXT_PUBLIC_SPOTIFY_REDIRECT_URI`
   **exactly**. Spotify no longer accepts `http://localhost` — for local dev use the loopback IP:
   `http://127.0.0.1:3000/spotify`.
2. Set `NUXT_PUBLIC_SPOTIFY_CLIENT_ID` in your `.env` to your app's client ID.
3. Open the app at **`http://127.0.0.1:3000`** so the browser origin matches the redirect.

While your app is in Spotify's default _Development mode_, only users you add under **Settings → User
Management** can log in (the app owner always can).

### Environment variables

Auth uses the **Authorization Code + PKCE** flow, so no client secret is required. All values are public (`NUXT_PUBLIC_*`) and are read at runtime by the server build (so Compose can inject them without a rebuild).

| Variable                           | Description                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_SPOTIFY_CLIENT_ID`    | Your Spotify app's client ID (a default is baked in, but login needs your own). |
| `NUXT_PUBLIC_SPOTIFY_REDIRECT_URI` | OAuth redirect URI. Empty → falls back to `${origin}/spotify`.                  |
| `NUXT_PUBLIC_GTAG_ID`              | GA4 measurement ID. Leave empty to disable analytics.                           |

## Local development

The app runs in Docker, but linting, tests, and the scrapers run on the host — so for contributing
you'll want **Node 22** (see [`.nvmrc`](.nvmrc) — run `nvm use`) and the dependencies installed:

```bash
npm install
npm run dev          # optional: Vite dev server with HMR at http://127.0.0.1:3000
```

`npm run dev` is a faster inner loop while editing; it reads the same `.env`.

### Checks

```bash
npm run lint         # ESLint (flat config via @nuxt/eslint)
npm run typecheck    # vue-tsc type checking
npm run test         # Vitest (unit + Nuxt component tests)
```

A pre-commit hook (husky + lint-staged) runs ESLint and Prettier on staged files. CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint, typecheck, test, and build on every push and pull request.

## Dataset

`public/npr_data.json` is generated from NPR's year-end lists (enriched with Spotify metadata) by the
dev-only scrapers in [`scrapers/`](scrapers/README.md) — run with `npm run scrape`. They are not part
of the app or its Docker image. Every list's NPR source is recorded in
[`scrapers/SOURCES.md`](scrapers/SOURCES.md).

## Deployment

`docker compose up --build` (or the built `npr-core` image) is the deploy artifact — a Node server that
reads `NUXT_PUBLIC_*` at runtime. Alternatively, since all data fetching happens in the browser, the app
can be shipped as a fully static site:

```bash
npm run generate     # → .output/public (deploy to any static host; env is baked in at build time)
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
  npr_data.json        # NPR best-of dataset (fetched client-side)
  images/              # logo + social card
scrapers/              # dev-only dataset builders (see scrapers/README.md)
test/                  # Vitest specs
```

## License

Licensed under [GPLv3](LICENSE). NPR and the NPR logo are property of [National Public Radio, Inc.](https://npr.org)

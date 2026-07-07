# Scrapers

Dev-only tooling that builds the app's dataset ([`public/npr_data.json`](../public/npr_data.json))
from NPR Music's year-end lists, enriching each entry with Spotify metadata (track/album/artist ids
and cover art).

Not part of the web app: Nuxt ignores this directory, it's excluded from the Docker image (see
[`.dockerignore`](../.dockerignore)), and its deps (`tsx`, `cheerio`) are `devDependencies`.

Every list's NPR source is documented in [`SOURCES.md`](SOURCES.md).

## Run

```bash
# Enrichment uses Spotify's Client Credentials flow (no user login):
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...

npm run scrape            # scrape → enrich → merge into public/npr_data.json
npm run typecheck:scrapers
```

The build **merges**: it replaces entries for the lists it just scraped and keeps every other list,
so re-running a year is idempotent and the historical album data is preserved.

## Layout

```
scrapers/
  build.ts            # entry point: scrape → enrich → merge → write
  lib/
    types.ts          # RawRanking + re-exported app data types (single source of truth)
    text.ts           # clean/strip-quotes helpers
    dailygraphics.ts  # scrape an NPR "best songs" dailygraphics app (.artist / .title)
    prose.ts          # parse server-rendered prose lists + follow NPR pagination
    spotify.ts        # Client Credentials auth + track/album lookup
    writeData.ts      # index by album/artist/track id; load / flatten / merge / write
  years/
    index.ts          # registry of list scrapers
    2021-songs.ts 2021-albums.ts 2022.ts 2023.ts 2024.ts 2025.ts
  tsconfig.json       # type gate (nuxt typecheck doesn't cover this dir)
```

Two source formats, both server-rendered:

- **Dailygraphics apps** (2023–2024) — the article embeds an app at
  `apps.npr.org/dailygraphics/graphics/best-songs-<year>-…/`; scrape its `.artist` / `.title`.
- **Prose pages** (2021, 2022, 2025) — the list is in the article body as artist/title headings (or a
  quoted-title paragraph). Multi-page lists publish each page as a separate story, so
  `scrapePaginated` parses page 1 then follows its `…-page-N` links.

## Data model

Best-**songs** lists resolve each song to its Spotify **track** (kept in `NprData.tracks`, keyed by
track id, for exact matching in the app). Best-**albums** lists resolve to albums (`NprData.albums`).
All entries are also indexed by artist. Song lists are alphabetical, so `ranked: 0`.

## Adding a list

Copy the closest existing `years/*.ts` module, point it at the new URL, and register it in
`years/index.ts`. Pick the parser by format: `scrapeBestSongsApp` (dailygraphics), or
`parseQuotedSongs` / `parseAlbumPairs` (prose, wrapped in `scrapePaginated` for multi-page lists).
A module just needs to export `list` and `scrape(): Promise<RawRanking[]>`.

Not yet covered: the "best music of YYYY" hub pages (2022, 2025) are indexes, not lists — they link
to the individual lists (which are the URLs already scraped here).

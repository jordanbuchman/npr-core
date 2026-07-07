// Runs every year scraper, enriches the rankings with Spotify metadata, and
// merges them into the dataset the app consumes (public/npr_data.json).
//
//   npm run scrape
//
// Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the environment for
// the enrichment step. Dev-only tooling — not part of the web app or its image.
import { playlistToEntries } from './lib/playlist'
import { createSpotifyClient, enrichRanking } from './lib/spotify'
import { buildDataset, flattenDataset, loadDataset, writeDataset } from './lib/writeData'
import { scrapers } from './years'
import { PLAYLISTS } from './years/playlists'
import type { NprEntry, RawRanking } from './lib/types'

async function main() {
  // 1. Scrape each list's raw rankings (a per-list failure is non-fatal).
  const raw: RawRanking[] = []
  for (const scraper of scrapers) {
    try {
      const rankings = await scraper.scrape()
      console.log(`[${scraper.list}] scraped ${rankings.length} rankings`)
      raw.push(...rankings)
    } catch (error) {
      console.error(`[${scraper.list}] failed:`, error)
    }
  }

  if (raw.length === 0 && PLAYLISTS.length === 0) {
    console.warn('No rankings scraped — nothing written.')
    return
  }

  // 2. Enrich each ranking with Spotify ids + cover art.
  const spotify = await createSpotifyClient()
  const fresh: NprEntry[] = []
  for (const ranking of raw) {
    const entry = await enrichRanking(spotify, ranking)
    if (entry) fresh.push(entry)
    else console.warn(`[${ranking.list}] no Spotify match: "${ranking.title}" — ${ranking.artist}`)
  }

  // 2b. Playlist-sourced lists: exact tracks straight from NPR Music's playlists.
  for (const { list, playlistId } of PLAYLISTS) {
    try {
      const entries = await playlistToEntries(spotify, playlistId, list)
      console.log(`[${list}] ${entries.length} tracks from playlist`)
      fresh.push(...entries)
    } catch (error) {
      console.error(`[${list}] playlist failed:`, error)
    }
  }

  // 3. Merge: keep existing entries from lists we didn't just scrape, then add
  //    the fresh ones. Re-running a list is idempotent; other lists are kept.
  const regenerated = new Set([
    ...raw.map((ranking) => ranking.list),
    ...PLAYLISTS.map((playlist) => playlist.list),
  ])
  const kept = flattenDataset(await loadDataset()).filter((entry) => !regenerated.has(entry.list))
  const merged = [...kept, ...fresh]

  const path = await writeDataset(buildDataset(merged))
  console.log(
    `Wrote ${fresh.length} new + ${kept.length} kept = ${merged.length} entries → ${path}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

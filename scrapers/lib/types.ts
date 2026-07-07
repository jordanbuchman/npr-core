// Reuse the app's data contract so scraper output can't drift from what the
// app consumes (app/types/npr.ts is the single source of truth).
import type { NprData, NprEntry } from '../../app/types/npr'

export type { NprData, NprEntry }

/** A ranking row as scraped from an NPR list, before Spotify enrichment. */
export interface RawRanking {
  /** Primary artist as printed by NPR. */
  artist: string
  /** Album title (album lists) or song title (song lists). */
  title: string
  /** List identifier, e.g. "2021" (albums) or "2024songs" (songs). */
  list: string
  kind: 'song' | 'album'
  /** False for unranked/alphabetical lists (most best-songs lists). */
  ranked: boolean
  /** 1-based position; only meaningful when `ranked` is true. */
  rank: number
}

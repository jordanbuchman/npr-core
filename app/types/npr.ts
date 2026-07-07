import type { SpotifyWebApi } from 'spotify-web-api-ts-edge'

// Derive the entity types from the client's own method signatures so we stay
// in sync with the library without importing its internal type paths.
type Personalization = SpotifyWebApi['personalization']
export type SpotifyTrack = Awaited<ReturnType<Personalization['getMyTopTracks']>>['items'][number]
export type SpotifyArtist = Awaited<ReturnType<Personalization['getMyTopArtists']>>['items'][number]

export type TimeRange = 'short_term' | 'medium_term' | 'long_term'

/** A single album/song entry from `public/npr_data.json`. */
export interface NprEntry {
  album_id: string
  artist_id: string
  /** Spotify track id — present for best-*songs* entries, absent for albums. */
  track_id?: string
  /** Album title for album entries; song title for song entries. */
  title: string
  artist: string
  cover: string
  /** e.g. `"2020"`, `"2020listeners"`, or `"2024songs"`. */
  list: string
  ranked: number
  rank: number
}

export interface NprData {
  albums: Record<string, NprEntry[]>
  artists: Record<string, NprEntry[]>
  /** Best-songs entries keyed by Spotify track id (optional for older datasets). */
  tracks?: Record<string, NprEntry[]>
}

export interface TrackMatch {
  npr: NprEntry
  user: SpotifyTrack
}

export interface ArtistMatch {
  npr: NprEntry
  user: SpotifyArtist
}

/** Shape consumed by the canvas graphic. `score` is a 0–100 percentage. */
export interface GraphicResults {
  songs: TrackMatch[]
  artists: ArtistMatch[]
  score: number
  verdict: string
}

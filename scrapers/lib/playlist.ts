import type { SpotifyWebApi } from 'spotify-web-api-ts-edge'
import type { NprEntry } from './types'

/**
 * Fetches all tracks from an NPR Music Spotify playlist as NPR song entries.
 * Used for years whose article pages are JS apps / mixed prose that can't be
 * scraped directly — the embedded playlist gives exact, Spotify-native tracks.
 * These lists are unranked (playlist order isn't a ranking).
 */
export async function playlistToEntries(
  spotify: SpotifyWebApi,
  playlistId: string,
  list: string,
): Promise<NprEntry[]> {
  const entries: NprEntry[] = []
  const seen = new Set<string>()
  let offset = 0

  for (;;) {
    const page = await spotify.playlists.getPlaylistItems(playlistId, { limit: 100, offset })
    for (const item of page.items) {
      const track = item.track
      if (!('album' in track)) continue // skip podcast episodes / local files
      if (seen.has(track.id)) continue
      seen.add(track.id)
      entries.push({
        track_id: track.id,
        album_id: track.album.id,
        artist_id: track.artists[0]?.id ?? '',
        title: track.name,
        artist: track.artists[0]?.name ?? '',
        cover: track.album.images[0]?.url ?? '',
        list,
        ranked: 0,
        rank: 0,
      })
    }
    if (!page.next || page.items.length === 0) break
    offset += page.items.length
  }

  return entries
}

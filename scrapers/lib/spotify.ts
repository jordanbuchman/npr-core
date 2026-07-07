import { SpotifyWebApi } from 'spotify-web-api-ts-edge'
import type { NprEntry, RawRanking } from './types'

/**
 * Builds a Spotify client authenticated with the Client Credentials flow
 * (server-to-server — no logged-in user, so it can only read public catalog
 * data, which is all the scrapers need). Requires app credentials in the env.
 */
export async function createSpotifyClient(): Promise<SpotifyWebApi> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to run the scrapers.')
  }

  const spotify = new SpotifyWebApi({ clientId, clientSecret })
  const { access_token } = await spotify.getTemporaryAppTokens()
  spotify.setAccessToken(access_token)
  return spotify
}

/**
 * Resolves a raw ranking to a full NprEntry via Spotify. Song lists look up the
 * exact track (keeping its id for exact matching in the app); album lists look
 * up the album. Returns null when there's no match.
 */
export async function enrichRanking(
  spotify: SpotifyWebApi,
  raw: RawRanking,
): Promise<NprEntry | null> {
  const base = {
    title: raw.title,
    artist: raw.artist,
    list: raw.list,
    ranked: raw.ranked ? 1 : 0,
    rank: raw.rank,
  }

  if (raw.kind === 'song') {
    const { items } = await spotify.search.searchTracks(`track:${raw.title} artist:${raw.artist}`, {
      limit: 1,
    })
    const track = items[0]
    if (!track) return null
    return {
      ...base,
      track_id: track.id,
      album_id: track.album.id,
      artist_id: track.artists[0]?.id ?? '',
      cover: track.album.images[0]?.url ?? '',
    }
  }

  const { items } = await spotify.search.searchAlbums(`album:${raw.title} artist:${raw.artist}`, {
    limit: 1,
  })
  const album = items[0]
  if (!album) return null
  return {
    ...base,
    album_id: album.id,
    artist_id: album.artists[0]?.id ?? '',
    cover: album.images[0]?.url ?? '',
  }
}

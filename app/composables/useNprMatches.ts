import { SpotifyWebApi } from 'spotify-web-api-ts-edge'
import type { ArtistMatch, NprData, TimeRange, TrackMatch } from '~/types/npr'

// The NPR dataset is large (~700 KB) and never changes within a session, so
// fetch it once on the client and reuse the promise across calls/timeframes.
let nprDataPromise: Promise<NprData> | null = null
function loadNprData(): Promise<NprData> {
  if (!nprDataPromise) nprDataPromise = $fetch<NprData>('/npr_data.json')
  return nprDataPromise
}

/**
 * Fetches the user's top tracks/artists for a timeframe and matches them
 * against NPR Music's best-albums lists. Refetches when the timeframe changes
 * or the user authenticates. Client-only (depends on the in-browser token).
 */
export function useNprMatches(timeframe: MaybeRefOrGetter<TimeRange>) {
  const { accessToken } = useSpotifyAuth()
  const timeframeRef = toRef(timeframe)

  const { data, status, error, refresh } = useAsyncData(
    'npr-matches',
    async () => {
      const token = accessToken.value
      if (!token) return { trackMatches: [] as TrackMatch[], artistMatches: [] as ArtistMatch[] }

      const nprData = await loadNprData()
      const spotify = new SpotifyWebApi({ accessToken: token })
      const [topTracks, topArtists] = await Promise.all([
        spotify.personalization.getMyTopTracks({ limit: 50, time_range: timeframeRef.value }),
        spotify.personalization.getMyTopArtists({ limit: 50, time_range: timeframeRef.value }),
      ])

      const trackMatches: TrackMatch[] = topTracks.items.flatMap((user) => {
        const npr = nprData.albums[user.album.id]?.[0]
        return npr ? [{ npr, user }] : []
      })
      const artistMatches: ArtistMatch[] = topArtists.items.flatMap((user) => {
        const npr = nprData.artists[user.id]?.[0]
        return npr ? [{ npr, user }] : []
      })

      return { trackMatches, artistMatches }
    },
    { server: false, lazy: true, watch: [timeframeRef, accessToken] },
  )

  const trackMatches = computed(() => data.value?.trackMatches ?? [])
  const artistMatches = computed(() => data.value?.artistMatches ?? [])
  const matchCount = computed(() => trackMatches.value.length + artistMatches.value.length)
  const score = computed(() => scoreFromMatches(matchCount.value))
  const pending = computed(() => status.value === 'pending')

  // Report the score to Google Analytics whenever it changes.
  watch(data, (value) => {
    if (!value) return
    useTrackEvent('nprcore_score', {
      tracks: value.trackMatches.length,
      artists: value.artistMatches.length,
      total: value.trackMatches.length + value.artistMatches.length,
    })
  })

  return { trackMatches, artistMatches, matchCount, score, pending, error, refresh }
}

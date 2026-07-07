import { SpotifyWebApi } from 'spotify-web-api-ts-edge'
import type { ArtistMatch, NprData, TimeRange, TrackMatch } from '~/types/npr'

// The NPR dataset is large (~700 KB) and never changes within a session, so
// fetch it once on the client and reuse the promise across calls/timeframes.
let nprDataPromise: Promise<NprData> | null = null
function loadNprData(): Promise<NprData> {
  if (!nprDataPromise) nprDataPromise = $fetch<NprData>('/npr_data.json')
  return nprDataPromise
}

// Cache the Spotify user id for the session (used to dedup score submissions).
let userIdPromise: Promise<string> | null = null
function getUserId(accessToken: string): Promise<string> {
  if (!userIdPromise) {
    userIdPromise = new SpotifyWebApi({ accessToken }).users.getMe().then((me) => me.id)
  }
  return userIdPromise
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
      if (!token) {
        return {
          trackMatches: [] as TrackMatch[],
          artistMatches: [] as ArtistMatch[],
          sampleSize: 0,
        }
      }

      const nprData = await loadNprData()
      const spotify = new SpotifyWebApi({ accessToken: token })
      const [topTracks, topArtists] = await Promise.all([
        spotify.personalization.getMyTopTracks({ limit: 50, time_range: timeframeRef.value }),
        spotify.personalization.getMyTopArtists({ limit: 50, time_range: timeframeRef.value }),
      ])

      const trackMatches: TrackMatch[] = topTracks.items.flatMap((user) => {
        // Exact best-song match first, then fall back to a best-albums match.
        const npr = nprData.tracks?.[user.id]?.[0] ?? nprData.albums[user.album.id]?.[0]
        return npr ? [{ npr, user }] : []
      })
      const artistMatches: ArtistMatch[] = topArtists.items.flatMap((user) => {
        const npr = nprData.artists[user.id]?.[0]
        return npr ? [{ npr, user }] : []
      })

      return {
        trackMatches,
        artistMatches,
        sampleSize: topTracks.items.length + topArtists.items.length,
      }
    },
    { server: false, lazy: true, watch: [timeframeRef, accessToken] },
  )

  const trackMatches = computed(() => data.value?.trackMatches ?? [])
  const artistMatches = computed(() => data.value?.artistMatches ?? [])
  const matchCount = computed(() => trackMatches.value.length + artistMatches.value.length)
  const sampleSize = computed(() => data.value?.sampleSize ?? 0)
  const raw = computed(() => rawScore(matchCount.value, sampleSize.value))
  const serverFinal = ref<number | null>(null)
  const score = computed(() => serverFinal.value ?? finalScore(raw.value)) // 0–100
  const pending = computed(() => status.value === 'pending')

  // On each result: report to analytics, and submit the raw score to the backend
  // (best-effort) to dedup and get a live CDF percentile. Falls back to the
  // seeded CDF (finalScore) when the backend is absent or the pepper is unset.
  watch(data, async (value) => {
    serverFinal.value = null
    if (!value) return
    const total = value.trackMatches.length + value.artistMatches.length
    const rawValue = rawScore(total, value.sampleSize)
    useTrackEvent('nprcore_score', {
      tracks: value.trackMatches.length,
      artists: value.artistMatches.length,
      total,
      sampled: value.sampleSize,
      raw: Math.round(rawValue * 1000) / 1000,
      score: finalScore(rawValue),
    })

    const token = accessToken.value
    if (!token) return
    try {
      const userId = await getUserId(token)
      const response = await $fetch<{ final: number | null }>('/api/score', {
        method: 'POST',
        body: { userId, raw: rawValue },
      })
      serverFinal.value = response.final
    } catch {
      serverFinal.value = null
    }
  })

  return {
    trackMatches,
    artistMatches,
    matchCount,
    sampleSize,
    raw,
    score,
    pending,
    error,
    refresh,
  }
}

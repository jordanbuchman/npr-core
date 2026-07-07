// Spotify Authorization Code flow with PKCE (the browser-friendly,
// non-deprecated flow). No client secret is required.

const SPOTIFY_SCOPE = 'user-top-read'
const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const VERIFIER_KEY = 'spotify_code_verifier'
const TOKEN_KEY = 'spotify_access_token'

const PKCE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

function randomString(length: number): string {
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values, (v) => PKCE_CHARS[v % PKCE_CHARS.length]).join('')
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64UrlEncode(digest)
}

export function useSpotifyAuth() {
  const config = useRuntimeConfig()
  const accessToken = useState<string | null>('spotify-access-token', () => null)

  // Restore a token persisted from an earlier step of the same tab session.
  if (import.meta.client && !accessToken.value) {
    accessToken.value = sessionStorage.getItem(TOKEN_KEY)
  }

  const redirectUri = () => config.public.spotifyRedirectUri || `${window.location.origin}/spotify`

  async function loginWithSpotify(state = '') {
    const verifier = randomString(64)
    sessionStorage.setItem(VERIFIER_KEY, verifier)

    const params = new URLSearchParams({
      client_id: config.public.spotifyClientId,
      response_type: 'code',
      redirect_uri: redirectUri(),
      scope: SPOTIFY_SCOPE,
      code_challenge_method: 'S256',
      code_challenge: await pkceChallenge(verifier),
      state,
    })
    window.location.assign(`${AUTHORIZE_URL}?${params.toString()}`)
  }

  async function exchangeCodeForToken(code: string): Promise<string> {
    const verifier = sessionStorage.getItem(VERIFIER_KEY)
    if (!verifier) throw new Error('Missing PKCE code verifier — please log in again.')

    const response = await $fetch<{ access_token: string }>(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(),
        client_id: config.public.spotifyClientId,
        code_verifier: verifier,
      }).toString(),
    })

    sessionStorage.removeItem(VERIFIER_KEY)
    sessionStorage.setItem(TOKEN_KEY, response.access_token)
    accessToken.value = response.access_token
    return response.access_token
  }

  function logout() {
    accessToken.value = null
    if (import.meta.client) sessionStorage.removeItem(TOKEN_KEY)
  }

  return {
    accessToken,
    isAuthenticated: computed(() => !!accessToken.value),
    loginWithSpotify,
    exchangeCodeForToken,
    logout,
  }
}

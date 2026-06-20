// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/test-utils/module', 'nuxt-gtag'],

  css: ['~/assets/css/main.css'],

  // Google Analytics is disabled unless NUXT_PUBLIC_GTAG_ID is set.
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID,
  },

  runtimeConfig: {
    public: {
      // Public Spotify app credentials (PKCE flow needs no client secret).
      // Override with NUXT_PUBLIC_SPOTIFY_CLIENT_ID / _REDIRECT_URI.
      spotifyClientId: 'd58342257cb443e6847a98d9a0476bbf',
      // Empty → falls back to `${origin}/spotify` at runtime.
      spotifyRedirectUri: '',
    },
  },
})

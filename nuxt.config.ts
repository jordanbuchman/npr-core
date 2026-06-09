// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    'nuxt-gtag'
  ],

  gtag: {
    id: 'G-XXXXXXXXXX' // TODO Google Analytics ID
  },

  runtimeConfig: {
    spotifyClientId: '',
    spotifyClientSecret: '',
    spotifyRedirectUri: '',
  },
})
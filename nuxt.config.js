export default {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'How NPRcore are you?',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'twitter:title', name: 'twitter:title', content: 'How NPRcore are you?'},
      { hid: 'twitter:description', name: 'twitter:description', content: 'Our Super Special Deep Learning Algorithm™ connects to your Spotify to figure out how NPRcore you are'},
      { hid: 'twitter:image', name: 'twitter:image', content: 'https://nprcore.me/images/twitter_card.png'},
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image'},

    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/fontawesome',
    '@nuxtjs/google-analytics'
  ],

  googleAnalytics: {
    id: 'UA-78510446-4'
  },

  fontawesome: {
    icons: {
      brands: ['faSpotify'],
      solid: ['faMusic']
    }
  },

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    '@nuxtjs/bulma',
    //'nuxt-buefy',
  ],

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
  },

}

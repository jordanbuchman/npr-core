import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // Default to a plain Node environment for fast pure-logic tests.
    // Component tests opt into the Nuxt environment via a
    // `// @vitest-environment nuxt` comment at the top of the file.
    environment: 'node',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
  },
})

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier/flat'

export default withNuxt(
  // Let Prettier own formatting; disable any conflicting ESLint stylistic rules.
  prettier,
  {
    rules: {
      // App-specific single-word component names (Results, Graphic) are fine here.
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    // Scrapers are dev-only Node CLI scripts; logging is how they report progress.
    files: ['scrapers/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
)

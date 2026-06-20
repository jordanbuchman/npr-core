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
)

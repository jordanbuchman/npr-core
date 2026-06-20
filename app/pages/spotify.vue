<template>
  <UContainer class="flex min-h-[80vh] flex-col items-center gap-6 py-8 text-center">
    <NprTitle />

    <div v-if="exchanging" class="flex items-center gap-2 text-muted">
      <UIcon name="i-lucide-loader-circle" class="animate-spin" />
      Connecting to Spotify…
    </div>

    <template v-else-if="isAuthenticated">
      <UTabs
        :model-value="timeframe"
        :items="tabs"
        class="w-full max-w-3xl"
        @update:model-value="onTabChange"
      />
      <Results :timeframe="timeframe" />
    </template>

    <template v-else>
      <p>You need to log in with Spotify to see your results.</p>
      <UButton icon="i-simple-icons-spotify" color="success" to="/">Log in with Spotify</UButton>
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import type { TimeRange } from '~/types/npr'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, exchangeCodeForToken } = useSpotifyAuth()

const timeframe = ref<TimeRange>('medium_term')
const exchanging = ref(false)

const tabs = [
  { label: 'Short-term', value: 'short_term' as TimeRange },
  { label: 'Medium-term', value: 'medium_term' as TimeRange },
  { label: 'Long-term', value: 'long_term' as TimeRange },
]

function onTabChange(value: string | number) {
  timeframe.value = value as TimeRange
}

onMounted(async () => {
  const code = route.query.code
  if (typeof code === 'string' && code) {
    exchanging.value = true
    try {
      await exchangeCodeForToken(code)
    } catch (err) {
      console.error('Spotify token exchange failed', err)
    } finally {
      exchanging.value = false
      // Drop the one-time ?code from the address bar, but keep ?state
      // (used by the verdict easter egg).
      const query = { ...route.query }
      delete query.code
      await router.replace({ query })
    }
  }
})

useHead({ title: 'How NPRcore are you? – Results' })
</script>

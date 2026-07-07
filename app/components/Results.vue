<template>
  <div class="w-full max-w-4xl">
    <h3 class="text-2xl font-semibold">
      You are
      <span class="rounded px-1 font-bold text-white" :style="{ backgroundColor: RED }">
        {{ score }}%
      </span>
      NPRcore!
    </h3>
    <h4 class="mt-1 text-xl">Verdict: {{ verdict }}</h4>

    <Graphic
      v-if="matchCount > 0"
      class="my-4"
      :results="{ songs: trackMatches, artists: artistMatches, score, verdict }"
    />

    <div v-if="pending" class="py-8 text-muted">Loading your top music…</div>
    <div v-else-if="error" class="py-8 text-error">
      Couldn’t load your Spotify data. Try logging in again.
    </div>
    <div v-else-if="matchCount === 0" class="py-8 text-muted">
      No NPRcore matches found for this timeframe.
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2">
      <section>
        <p class="mb-2">
          <strong>{{ trackMatches.length }}</strong> matched tracks
        </p>
        <div class="max-h-72 space-y-2 overflow-y-auto">
          <UCard v-for="match in trackMatches" :key="match.user.id" :ui="{ body: 'p-3' }">
            <article class="flex items-center gap-3 text-left">
              <img
                :src="match.npr.cover"
                :alt="match.npr.title"
                class="h-16 w-16 shrink-0 rounded"
              />
              <p class="text-sm">
                <strong>{{ match.npr.artist }}</strong
                ><br />
                <template v-if="match.npr.track_id">“{{ match.npr.title }}”</template>
                <template v-else
                  ><em>{{ match.user.name }}</em> from “{{ match.npr.title }}”</template
                >
                <br />
                <span v-if="match.npr.ranked">#{{ match.npr.rank }} on </span
                >{{ nprListLabel(match.npr) }}
              </p>
            </article>
          </UCard>
        </div>
      </section>

      <section>
        <p class="mb-2">
          <strong>{{ artistMatches.length }}</strong> matched artists
        </p>
        <div class="max-h-72 space-y-2 overflow-y-auto">
          <UCard v-for="match in artistMatches" :key="match.user.id" :ui="{ body: 'p-3' }">
            <article class="flex items-center gap-3 text-left">
              <img
                :src="match.user.images[0]?.url"
                :alt="match.npr.title"
                class="h-16 w-16 shrink-0 rounded"
              />
              <p class="text-sm">
                <strong>{{ match.npr.artist }}</strong
                ><br />
                “{{ match.npr.title }}”<br />
                <span v-if="match.npr.ranked">#{{ match.npr.rank }} on </span
                >{{ nprListLabel(match.npr) }}
              </p>
            </article>
          </UCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NprEntry, TimeRange } from '~/types/npr'

const props = defineProps<{ timeframe: TimeRange }>()

const RED = '#C63229'
const route = useRoute()
const { trackMatches, artistMatches, matchCount, score, pending, error } = useNprMatches(
  () => props.timeframe,
)

const verdict = computed(() => verdictFromScore(score.value, route.query.state === 'correct'))

/** "NPR Music's [Listeners'] Top Songs/Albums of YYYY" for a matched entry. */
function nprListLabel(npr: NprEntry): string {
  const year = npr.list.substring(0, 4)
  const kind = npr.track_id ? 'Songs' : 'Albums'
  const listeners = npr.list.endsWith('listeners') ? "Listeners' " : ''
  return `NPR Music's ${listeners}Top ${kind} of ${year}`
}
</script>

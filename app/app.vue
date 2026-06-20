<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const description =
  'See how your Spotify listening stacks up against NPR Music’s best-albums lists.'

useSeoMeta({
  title: 'How NPRcore are you?',
  description,
  ogTitle: 'How NPRcore are you?',
  ogDescription: description,
  ogImage: '/images/twitter_card.png',
  twitterCard: 'summary_large_image',
  twitterImage: '/images/twitter_card.png',
})
</script>

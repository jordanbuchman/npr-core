<template>
  <UContainer class="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
    <NprTitle />
    <UButton
      icon="i-simple-icons-spotify"
      size="xl"
      color="success"
      :loading="loading"
      @click="login"
    >
      Log in with Spotify
    </UButton>
  </UContainer>
</template>

<script setup lang="ts">
const { loginWithSpotify } = useSpotifyAuth()
const loading = ref(false)

async function login() {
  loading.value = true
  // Preserve the easter-egg state carried in the URL hash, as the original did.
  const state = window.location.hash.replace('#', '')
  await loginWithSpotify(state)
}

useHead({ title: 'How NPRcore are you?' })
</script>

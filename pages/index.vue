<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">
        npr-core
      </h1>
      <div class="links">
        <a
          href="https://accounts.spotify.com/authorize?client_id=d58342257cb443e6847a98d9a0476bbf&redirect_uri=http:%2F%2Flocalhost:3000%2Fspotify&scope=user-top-read&response_type=token&state=123"
          target="_self"
          class="button--green"
        >
          Log in with Spotify
        </a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          Last.fm
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

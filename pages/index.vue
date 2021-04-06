<template>

  <div class="container">
    <div>
      <h1 class="title is-1 my-2">
        How <img src="/images/nprlogo.png" style="height:3rem; vertical-align:bottom" /> core are you?
      </h1>
      <div class="links">
        <a 
          v-bind:href="redirect_uri"
          target="_self"
          class="button is-medium is-success"
        >
          <span class="icon is-medium" style="margin-right: 0.25rem"> <font-awesome-icon :icon="['fab', 'spotify']" /> </span> Log in with Spotify 
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data(){
    return {
      redirect_uri: `https://accounts.spotify.com/authorize?client_id=d58342257cb443e6847a98d9a0476bbf&redirect_uri=http:%2F%2F${window.location.host}%2Fspotify&scope=user-top-read&response_type=token&state=${window.location.hash.replace("#","")}`
    }
  }
})
</script>

<style>

.container {
  margin: 0 auto;
  /*min-height: 100vh;*/
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  max-width: 90vw;
}

/*
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
*/
.links {
  padding-top: 15px;
}

</style>

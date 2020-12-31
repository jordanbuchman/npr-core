<template>
  <div class="container">
    <div>
      <div class="links">
        <a
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
          v-bind:class="[{'button--grey--active': currentTab == 'short_term'}]"
          v-on:click="currentTab = 'short_term'"
        >
          Short-term
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
          v-bind:class="[{'button--grey--active': currentTab == 'medium_term'}]"
          v-on:click="currentTab = 'medium_term'"
        >
          Medium-term
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
          v-bind:class="[{'button--grey--active': currentTab == 'long_term'}]"
          v-on:click="currentTab = 'long_term'"
        >
          Long-term
        </a>
      </div>
      
      <Results v-bind:timeframe="currentTab" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return{
      currentTab: "medium_term"
    }
  }
})
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

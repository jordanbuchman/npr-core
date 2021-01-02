<template>
  <div class="container">
    <div>
      <h1 class="title is-1 my-5">
        How <img src="/images/nprlogo.png" style="height:3rem; vertical-align:bottom" /> core are you?
      </h1>
      <div class="tabs is-toggle is-centered is-fullwidth">
        <ul>
          <li v-bind:class="[{'is-active': currentTab == 'short_term'}]">
            <a
              v-on:click="currentTab = 'short_term'"
            >
              Short-term
            </a>
          </li>
          <li v-bind:class="[{'is-active': currentTab == 'medium_term'}]">
            <a
              v-bind:class="[{'button is-active': currentTab == 'medium_term'}]"
              v-on:click="currentTab = 'medium_term'"
            >
              Medium-term
            </a>
          </li>
          <li v-bind:class="[{'is-active': currentTab == 'long_term'}]">
            <a
              v-bind:class="[{'button is-active': currentTab == 'long_term'}]"
              v-on:click="currentTab = 'long_term'"
            >
              Long-term
            </a>
          </li>
        </ul>
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
.site {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site_content {
  flex: 1;
}
  .container {
    margin: 0 auto;
    /*min-height: 100vh;*/
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    max-width: 90vw;
  }
</style>

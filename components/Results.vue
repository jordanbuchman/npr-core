<template>
  <ul id="matches">
    <li v-for="match in matches" :key="match.user.id">
      <p> {{match.npr.artist}} - {{match.user.name}} : {{match.npr.title}} is <span v-if="match.npr.ranked"> ranked {{match.npr.rank}} </span> on {{match.npr.list}}</p>
    </li>
  </ul>
</template>

<script lang="ts">
  import SpotifyWebApi from 'spotify-web-api-js';
  import npr_data from '~/assets/npr_data.json'

  type SpotifyUserPair= {
    npr: Object;
    user: Object;
  }
  
  export default {
    props: {
      timeframe: String
    },
    data () {
      return {
        matches: [] as Array<SpotifyUserPair>
      }
    },
    created() {
      this.getNPRMatches();
    },

    watch: { 
      timeframe: function(newVal, oldVal) { // watch it
        this.getNPRMatches();
      }
    },
    methods: {
      async getDataFromSpotify(){
        let hash = this.$route.hash;
        let access_token = hash.substring(1).split('&').map(pair => pair.split('=')).filter(pair => pair[0] === 'access_token')[0][1];

        let spotify = new SpotifyWebApi();
        spotify.setAccessToken(access_token);

        let top_tracks = await spotify.getMyTopTracks({limit: 50, time_range: this.$props.timeframe});

        return top_tracks.items;

      },

      async getNPRMatches() {
        const matches: Array<SpotifyUserPair> = [];

        const spotify_data = await this.getDataFromSpotify();

        spotify_data.forEach(track => {
          if (Object.keys(npr_data).includes(track.album.id)){
            matches.push({
              npr: npr_data[track.album.id],
              user: track
            })
          }
        });

        this.matches = matches;

      }
    }
  }
</script>

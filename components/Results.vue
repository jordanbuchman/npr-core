<template>
<div>
    <ul id="matches">
      <li v-for="match in matches" :key="match.user.id">
        <p> {{match.npr.artist}} - {{match.user.name}} : {{match.npr.title}} is <span v-if="match.npr.ranked"> ranked {{match.npr.rank}} </span> on {{match.npr.list}}</p>
      </li>
    </ul>
    <Graphic v-bind:results="{songs: matches.slice(0,3)}"/>
  </div>
</template>

<script lang="ts">
  import SpotifyWebApi from 'spotify-web-api-js';
  import npr_data from '~/assets/npr_data.json';
  import { fabric } from 'fabric';
  import { promisify } from 'es6-promisify';

  //const imageFromURL = promisify(fabric.Image.fromURL);
  const imageFromURL = function(url: string) {
    return new Promise(resolve => {
      fabric.Image.fromURL(url, function(img) {
        resolve(img);
      });
    });
  };

  type SpotifyUserPair= {
    npr: Object;
    user: SpotifyApi.TrackObjectFull;
  }
  
  export default {
    props: {
      timeframe: String
    },
    data () {
      return {
        matches: [] as Array<SpotifyUserPair>,
      }
    },
    async created() {
      await this['getNPRMatches']();
    },
    watch: { 
      timeframe: async function(newVal:any, oldVal:any) { // watch it
        await this['getNPRMatches']();
      }
    },
    methods: {

      async getDataFromSpotify(): Promise<Array<SpotifyApi.TrackObjectFull>> {
        let hash = this['$route'].hash;
        let access_token = hash.substring(1).split('&').map((pair:string) => pair.split('=')).filter((pair:Array<string>) => pair[0] === 'access_token')[0][1];

        let spotify = new SpotifyWebApi();
        spotify.setAccessToken(access_token);

        let top_tracks = await spotify.getMyTopTracks({limit: 50, time_range: this['$props'].timeframe});

        return top_tracks.items;

      },

      async getNPRMatches() {
        const matches: Array<SpotifyUserPair> = [];

        const spotify_data = await this.getDataFromSpotify();

        spotify_data.forEach( (track:any) => {
          if (Object.keys(npr_data).includes(track.album.id)){
            matches.push({
              npr: npr_data[track.album.id],
              user: track
            })
          }
        });

        this['matches'] = matches;

      }
    }
  }
</script>

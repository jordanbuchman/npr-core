<template>
<div>
    <h3 class="subtitle is-3">You are <span class="has-text-white has-text-weight-bold px-1" style="background-color: #C63229"> {{score*100}}%</span> NPRcore! </h3>
    <div class="columns">
      <div class="column">
        <strong> {{track_matches.length}} </strong> matched tracks
        <ul id="track_matches">
          <li v-for="match in track_matches" :key="match.user.id">
            <article class="media my-1">
              <figure class="media-left">
                <p class="">
                  <img style="height: 4.5em;" :src="match.npr.cover">
                </p>
              </figure>
              <div class="media-content">
                <div class="has-text-left content">
                  <p>
                    <strong>{{match.npr.artist}}</strong>
                    <br>
                    <em>{{match.user.name}}</em> from "{{match.npr.title}}"
                    <br>
                    <span v-if="match.npr.ranked == 1">#{{match.npr.rank}} on </span> NPR Music's {{match.npr.list}}
                  </p>
                </div>
              </div>
            </article>
          </li>
        </ul>
      </div>
      <div class="column">
        <strong> {{artist_matches.length}} </strong> matched artists
        <ul id="artist_matches">
          <li v-for="match in artist_matches" :key="match.user.id">
            <article class="media my-1">
              <figure class="media-left">
                <p class="">
                  <img style="height: 4.5em;" :src="match.user.images[0].url">
                </p>
              </figure>
              <div class="media-content">
                <div class="has-text-left content">
                  <p>
                    <strong>{{match.npr.artist}}</strong>
                    <br>
                    "{{match.npr.title}}"
                    <br>
                    <span v-if="match.npr.ranked == 1">#{{match.npr.rank}} on </span> NPR Music's {{match.npr.list}}
                  </p>
                </div>
              </div>
            </article>
          </li>
        </ul>
      </div>
    </div>
    
    <!--<Graphic v-bind:results="{songs: track_matches, score: score*100, artists: artist_matches}"/>-->
  </div>
</template>

<script lang="ts">
  import SpotifyWebApi from 'spotify-web-api-js';
  import npr_data from '~/assets/npr_data.json';
  import { promisify } from 'es6-promisify';

  type SpotifyUserPair= {
    npr: Object;
    user: SpotifyApi.TrackObjectFull;
  }

  type ArtistUserPair= {
    npr: Object;
    user: SpotifyApi.ArtistObjectFull;
  }
  
  export default {
    props: {
      timeframe: String
    },
    data () {
      return {
        track_matches: [] as Array<SpotifyUserPair>,
        artist_matches: [] as Array<ArtistUserPair>
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

      async getDataFromSpotify(): Promise<{tracks: Array<SpotifyApi.TrackObjectFull>, artists: Array<SpotifyApi.ArtistObjectFull>}> {
        let hash = this['$route'].hash;
        let access_token = hash.substring(1).split('&').map((pair:string) => pair.split('=')).filter((pair:Array<string>) => pair[0] === 'access_token')[0][1];

        let spotify = new SpotifyWebApi();
        spotify.setAccessToken(access_token);

        let top_tracks = await spotify.getMyTopTracks({limit: 50, time_range: this['$props'].timeframe});
        let top_artists = await spotify.getMyTopArtists({limit: 50, time_range: this['$props'].timeframe});

        return {
          tracks: top_tracks.items,
          artists: top_artists.items
        }

      },

      async getNPRMatches() {
        let track_matches: Array<SpotifyUserPair> = [];
        let artist_matches: Array<ArtistUserPair> = [];

        const spotify_data = await this['getDataFromSpotify']();

        spotify_data.tracks.forEach( (track:any) => {
          if (Object.keys(npr_data.albums).includes(track.album.id)){
            track_matches.push({
              npr: npr_data.albums[track.album.id][0],
              user: track
            })
          }
        });
        spotify_data.artists.forEach( (artist: SpotifyApi.ArtistObjectFull) => {
          if (Object.keys(npr_data.artists).includes(artist.id)){
            artist_matches.push({
              npr: npr_data.artists[artist.id][0],
              user: artist
            })
          }
        });

        this['track_matches'] = track_matches;
        this['artist_matches'] = artist_matches;
      }
    },

    computed: {
      score: function() {
        return ((this['track_matches'] as []).length + (this['artist_matches'] as []).length) / 100
      }
    }
  }
</script>

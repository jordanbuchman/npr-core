<template>
<div>
    <h3 class="subtitle is-3">You are <span class="has-text-white has-text-weight-bold px-1" style="background-color: #C63229"> {{Math.round(score*100)}}%</span> NPRcore! </h3>
    <h4 class="subtitle is-4">Verdict: {{verdict}} </h4>
    <Graphic v-bind:results="{songs: track_matches, score: score*100, artists: artist_matches, verdict: verdict}"/>
    <div class="columns">
      <div class="column">
        <strong> {{track_matches.length}} </strong> matched tracks
        <div class="box" style="max-height: 12em; overflow-y:auto">
          <ul id="track_matches">
            <li v-for="match in track_matches" :key="match.user.id">
              <article class="media my-1 box">
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
                      <span v-if="match.npr.ranked == 1">#{{match.npr.rank}} on </span> NPR Music's <span v-if="match.npr.list.endsWith('listeners')"> Listeners' </span> Top Albums of {{match.npr.list.substring(0,4)}}
                    </p>
                  </div>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </div>
      <div class="column">
        <strong> {{artist_matches.length}} </strong> matched artists
        <div class="box" style="max-height: 12em; overflow-y:auto">
          <ul id="artist_matches">
            <li v-for="match in artist_matches" :key="match.user.id">
              <article class="media my-1 box">
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
                      <span v-if="match.npr.ranked == 1">#{{match.npr.rank}} on </span> NPR Music's <span v-if="match.npr.list.endsWith('listeners')"> Listeners' </span> Top Albums of {{match.npr.list.substring(0,4)}}
                    </p>
                  </div>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </div>
    </div>
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

  const percentile = (arr: any, val: any) =>
  (100 *
    arr.reduce(
      (acc: any, v: any) => acc + (v < val ? 1 : 0) + (v === val ? 0.5 : 0),
      0
    )) /
  arr.length;
  
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

        this['$ga']['event']({
          eventCategory: 'Spotify - Score',
          eventAction: 'Total',
          eventLabel: ((this['track_matches'] as []).length + (this['artist_matches'] as []).length).toString()
        });
        this['$ga']['event']({
          eventCategory: 'Spotify - Score',
          eventAction: 'Tracks',
          eventLabel: (this['track_matches'] as []).length.toString()
        });
        this['$ga']['event']({
          eventCategory: 'Spotify - Score',
          eventAction: 'Artists',
          eventLabel: (this['artist_matches'] as []).length.toString()
        });
      }
    },

    computed: {
      score() {
        const percentiles = [0, 3, 4, 5, 6, 8, 10, 11, 13, 15, 17, 20, 22, 25, 27, 30, 33, 36, 39, 41, 44, 47, 50, 53, 56, 59, 61, 64, 67, 69, 71, 74, 76, 78, 80, 82, 83, 85, 87, 88, 89, 90, 92, 93, 93, 94, 95, 96, 96, 97, 97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
        let s = (this['track_matches'] as []).length + (this['artist_matches'] as []).length;
        return percentiles[s]/100;
        // return Math.floor(percentile([3, 3, 3, 4, 4, 4, 5, 5, 6, 7, 7, 7, 7, 7, 8, 10, 10, 10, 11, 11, 11, 12, 12, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 18, 18, 18, 18, 18, 18, 19, 20, 20, 21, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 24, 24, 24, 25, 25, 26, 26, 26, 27, 27, 27, 27, 27, 27, 28, 29, 29, 29, 29, 30, 31, 31, 31, 31, 32, 32, 32, 33, 33, 33, 34, 34, 34, 34, 35, 35, 36, 36, 36, 37, 38, 39, 39, 39, 40, 40, 41, 41, 43, 43, 43, 43, 45, 45, 45, 45, 46, 65], s))/100
      },
      verdict() {
        let verdicts = ["No Things Considered", "Obama is your favorite president", "You probably say you like \"indie music\"", "You own at least one NPR tote bag", "You're literally Ira Glass"];
        if (window.location.hash.includes("&state=correct")) {
          verdicts = ["No Things Considered", "Obama is your favorite president", "You probably say you like \"indie music\"", "You own at least one NPR tote bag", "You're literally Patrick Murray"];
        }
        return verdicts[Math.floor(verdicts.length*(this['score'] as any))];
      }
    }
  }
</script>

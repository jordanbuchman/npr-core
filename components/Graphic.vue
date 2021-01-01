<template>
<div>
    <canvas id="c" width="800" height="800"></canvas>
  </div>
</template>

<script lang="ts">
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
      results: Object
    },
    async mounted() {
      console.log(this['$props'].results);
      this['canvas'] = new fabric.StaticCanvas("c");
      if (this['$props'].results.songs.length == 3) {
        this['drawCanvas']();
      }
    },
    watch: { 
      results: async function(newVal:any, oldVal:any) { // watch it
        if (this['$props'].results.songs.length == 3) {
          this['canvas'].clear();
          this['drawCanvas']();
        }
      }
    },
    methods: {
      async drawCanvas() {
          let group = await this['generateSongList'](this['$props'].results.songs);
          group.set({
            left: 0,
            top: 0
          });
          this['canvas'].add(group);
          this['canvas'].renderAll();
      },
      async generateSong(song: SpotifyUserPair): Promise<fabric.Group> {
        let group = new fabric.Group();

        let albumImg = await imageFromURL(song.npr['cover']) as fabric.Image;
        console.log(albumImg);
        albumImg.set({
          top: 0
        });
        albumImg.scaleToHeight(100);
        albumImg.scaleToWidth(100);
        group.add(albumImg);
        let albumText = new fabric.Textbox(`${song.user.artists[0].name} - ${song.user.name}\nFrom \"${song.npr['title']}\", ranked ${song.npr['rank']} on ${song.npr['list']}`, {
          top: 110,
          width: 100,
          fontSize: 10
        });
        group.add(albumText);
        group.addWithUpdate();

        return group;
      },

      async generateSongList(songs: Array<SpotifyUserPair>): Promise<fabric.Group> {
        console.log(songs.length);
        let songPromises = songs.map(this.generateSong);
        let group = new fabric.Group();
        let songGroups = await Promise.all(songPromises);
        songGroups[0].set({
          left: 0
        });
        group.add(songGroups[0]);
        songGroups[1].set({
          left: 110
        });
        group.add(songGroups[1]);
        songGroups[2].set({
          left: 220
        });
        group.add(songGroups[2]);
        group.addWithUpdate();
        return group;
      }
    }
  }
</script>

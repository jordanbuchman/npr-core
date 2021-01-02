<template>
<div>
    <canvas style="border: 5px solid red" id="c" width="800" height="450"></canvas>
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
          this['canvas'].setBackgroundColor('#ffffff', this['canvas'].renderAll.bind(this['canvas']));
          let score = await this['generateScore'](this['$props'].results.score);
          score.set({
            top: 10,
          });
          this['canvas'].add(score);
          score.centerH();

          let verdict = this['generateVerdict'](this['$props'].results.score);
          verdict.set({
            top: score.getBoundingRect().height+20
          })
          this['canvas'].add(verdict);
          verdict.centerH();

          let group = await this['generateSongListWithTitle'](this['$props'].results.songs);
          group.set({
            left: 10,
            top: verdict.getCoords()[3].y+10
          });
          this['canvas'].add(group);

          this['canvas'].renderAll();
      },
      generateVerdict(score: number) {
        const verdicts = ["You've never heard a banjo", "You probably say you like \"indie music\"", "You own at least one tote bag", "You're literally Ira Glass"];
        let verdict = verdicts[Math.round(verdicts.length*(score/100))];
      
        let verdictText = new fabric.Text(`Verdict: ${verdict}`, {
          fontSize: 20,
          fontFamily: 'Trebuchet MS',
        });

        return verdictText;
      },
      async generateScore(score: number) {
        let group = new fabric.Group();

        let beginText = new fabric.Text(`You are ${score}% `, {
          fontSize: 40,
          fontFamily: 'Trebuchet MS',
          top: 0,
          left: 0
        });
        group.add(beginText);

        let nprImg = await imageFromURL('/images/nprlogo.png') as fabric.Image;
        nprImg.scaleToHeight(40);
        nprImg.set({
          top: 3,
          left: beginText.getBoundingRect().width
        })
        group.add(nprImg)

        let endText = new fabric.Text(` core`, {
          fontSize: 40,
          fontFamily: 'Trebuchet MS',
          top:0,
          left: beginText.getBoundingRect().width + nprImg.getBoundingRect().width
        });
        group.add(endText);
     
        group.addWithUpdate();

        return group;
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
          fontSize: 10,
          fontFamily: 'Trebuchet MS'
        });
        group.add(albumText);
        group.addWithUpdate();

        return group;
      },

      async generateSongListWithTitle(songs: Array<SpotifyUserPair>): Promise<fabric.Group> {
        let group = new fabric.Group();

        let titleText = new fabric.Text(`Your top ${songs.length} NPRcore songs:`, {
          fontSize: 20,
          fontFamily: 'Trebuchet MS',
          originX: 'center'
        });
        group.add(titleText);

        let songList = await this['generateSongList'](songs);
        songList.set({
          top: titleText.getBoundingRect().height + 5,
          originX: 'center'
        })
        group.add(songList);

        group.addWithUpdate();

        return group;
      },

      async generateSongList(songs: Array<SpotifyUserPair>): Promise<fabric.Group> {
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

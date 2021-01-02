<template>
<div>
    <a id="graphic_download" class="button is-primary is-medium">
      Download results graphic 
    </a>
    <canvas style="display:none" id="c" width="800" height="450"></canvas>
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
      }, { crossOrigin: 'anonymous'});
    });
  };

  type SpotifyUserPair= {
    npr: Object;
    user: SpotifyApi.TrackObjectFull;
  }

  type ArtistUserPair= {
    npr: Object;
    user: SpotifyApi.ArtistObjectFull;
  }
  
  const ALBUM_IMAGE_SIZE = 110;

  export default {
    props: {
      results: Object
    },
    async mounted() {
      this['canvas'] = new fabric.StaticCanvas("c");
        this['drawCanvas']();
    },
    watch: { 
      results: async function(newVal:any, oldVal:any) { // watch it
          this['canvas'].clear();
          this['drawCanvas']();
      }
    },
    methods: {
      async drawCanvas() {
          this['canvas'].setBackgroundColor('#ffffff', this['canvas'].renderAll.bind(this['canvas']));

          this['canvas'].add(new fabric.Rect({left:0, top:0, fill: 'transparent', stroke: '#C63229', strokeWidth: 5, strokeLineJoin: 'round', width: this['canvas'].getWidth()-5, height: this['canvas'].getHeight()-5}))
          let score = await this['generateScore'](this['$props'].results.score);
          score.set({
            top: 20,
          });
          this['canvas'].add(score);
          score.centerH();

          let verdict = this['generateVerdict'](this['$props'].results.score);
          verdict.set({
            top: score.getCoords()[3].y + 20
          })
          this['canvas'].add(verdict);
          verdict.centerH();

          let group = await this['generateSongListWithTitle'](this['topSongs']);
          group.set({
            left: 20,
            top: verdict.getCoords()[3].y+20
          });
          this['canvas'].add(group);

          let group2 = await this['generateArtistListWithTitle'](this['topArtists']);
          group2.set({
            left: this['canvas'].getWidth() - group2.getBoundingRect().width - 20,
            top: verdict.getCoords()[3].y+20
          });
          this['canvas'].add(group2);
        

          let footer = await this['generateFooter']();
          footer.set({
            left: this['canvas'].getWidth() - footer.getBoundingRect().width - 10,
            top: this['canvas'].getHeight() - footer.getBoundingRect().height - 10
          })
          this['canvas'].add(footer);

          this['canvas'].renderAll();

          (document.getElementById("c") as any).toBlob(function(blob: any) {
            (document.getElementById("graphic_download") as any).setAttribute('href', URL.createObjectURL(blob));
            (document.getElementById("graphic_download") as any).setAttribute('download', "NPRcore.png");
	        });

      },

      generateFooter() {
        const FONT_SIZE = 25;

        let urlText = new fabric.Text('nprco.re', {
          fontSize: FONT_SIZE,
          fontFamily: 'Trebuchet MS',
        });
        
        return urlText;
      },
      generateVerdict(score: number) {
        const FONT_SIZE = 25;

        const verdicts = ["You've never heard a banjo", "Obama is your favorite president", "You probably say you like \"indie music\"", "You own at least one tote bag", "You're literally Ira Glass"];
        let verdict = verdicts[Math.round(verdicts.length*(score/100))];
      
        let verdictText = new fabric.Text(`Verdict: ${verdict}`, {
          fontSize: FONT_SIZE,
          fontFamily: 'Trebuchet MS',
        });

        return verdictText;
      },
      async generateScore(score: number) {

        const FONT_SIZE = 60;

        let group = new fabric.Group();

        let styles = {};
        if (score >= 10) {
          styles = {
            0: {
              8: { fill: '#ffffff', textBackgroundColor: '#C63229' },
              9: { fill: '#ffffff', textBackgroundColor: '#C63229' },
              10: { fill: '#ffffff', textBackgroundColor: '#C63229' },
              11: { fill: '#ffffff', textBackgroundColor: '#C63229' },
              12: { fill: '#ffffff', textBackgroundColor: '#C63229' },
            }
          };
        }
        else {
          styles = {
            0: {
              8: { fill: '#ffffff', textBackgroundColor: '#C63229' },
              9: { fill: '#ffffff', textBackgroundColor: '#C63229' },
              10: { fill: '#ffffff', textBackgroundColor: '#C63229' },
              11: { fill: '#ffffff', textBackgroundColor: '#C63229' },
            }
          }
        }

        let beginText = new fabric.IText(`You are  ${score}%  `, {
          fontSize: FONT_SIZE,
          fontFamily: 'Trebuchet MS',
          top: 0,
          left: 0,
          styles: styles
        });
        group.add(beginText);


        let nprImg = await imageFromURL('/images/nprlogo.png') as fabric.Image;

        nprImg.scaleToHeight(FONT_SIZE);
        nprImg.set({
          top: 3,
          left: beginText.getBoundingRect().width
        })
        group.add(nprImg)

        let endText = new fabric.Text(` core`, {
          fontSize: FONT_SIZE,
          fontFamily: 'Trebuchet MS',
          top:0,
          left: beginText.getBoundingRect().width + nprImg.getBoundingRect().width
        });
        group.add(endText);
     
        group.addWithUpdate();

        return group;
      },
      async generateSong(song: SpotifyUserPair): Promise<fabric.Group> {
        const FONT_SIZE = 12;

        let group = new fabric.Group();

        let albumImg = await imageFromURL(song.npr['cover']) as fabric.Image;
        albumImg.set({
          top: 0
        });
        albumImg.scaleToHeight(ALBUM_IMAGE_SIZE);
        albumImg.scaleToWidth(ALBUM_IMAGE_SIZE);
        group.add(albumImg);
        let albumText = new fabric.Textbox(`${song.user.artists[0].name} / ${song.user.name} / \"${song.npr['title']}\" is ranked ${song.npr['rank']} on ${song.npr['list']}`, {
          top: ALBUM_IMAGE_SIZE+10,
          width: ALBUM_IMAGE_SIZE,
          fontSize: FONT_SIZE,
          fontFamily: 'Trebuchet MS',
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
        if (songGroups.length > 0) {
          songGroups[0].set({
            left: 0
          });
          group.add(songGroups[0]);
        }
        if (songGroups.length > 1) {
          songGroups[1].set({
            left: ALBUM_IMAGE_SIZE+10
          });
          group.add(songGroups[1]);
        }
        if (songGroups.length > 2) {
          songGroups[2].set({
            left: ALBUM_IMAGE_SIZE*2+20
          });
          group.add(songGroups[2]);
        }

        group.add(new fabric.Rect({
          width:ALBUM_IMAGE_SIZE*3+20,
          fill: 'transparent',
          stroke: 'transparent'
        }))

        group.addWithUpdate();
        return group;
      },
      // GENERATE ARTIST
      async generateArtist(song: ArtistUserPair): Promise<fabric.Group> {
        const FONT_SIZE = 12;

        let group = new fabric.Group();

        let albumImg = await imageFromURL(song.user.images[0].url) as fabric.Image;
        albumImg.set({
          top: 0
        });
        albumImg.scaleToHeight(ALBUM_IMAGE_SIZE);
        albumImg.scaleToWidth(ALBUM_IMAGE_SIZE);
        group.add(albumImg);
        let albumText = new fabric.Textbox(`${song.user.name}'s \"${song.npr['title']}\" is ranked ${song.npr['rank']} on ${song.npr['list']}`, {
          top: ALBUM_IMAGE_SIZE+10,
          width: ALBUM_IMAGE_SIZE,
          fontSize: FONT_SIZE,
          fontFamily: 'Trebuchet MS',
        });
        group.add(albumText);
        group.addWithUpdate();

        return group;
      },

      async generateArtistListWithTitle(songs: Array<ArtistUserPair>): Promise<fabric.Group> {
        let group = new fabric.Group();

        let titleText = new fabric.Text(`Your top ${songs.length} NPRcore artists:`, {
          fontSize: 20,
          fontFamily: 'Trebuchet MS',
          originX: 'center'
        });
        group.add(titleText);

        let songList = await this['generateArtistList'](songs);
        songList.set({
          top: titleText.getBoundingRect().height + 5,
          originX: 'center'
        })
        group.add(songList);

        group.addWithUpdate();

        return group;
      },

      async generateArtistList(songs: Array<ArtistUserPair>): Promise<fabric.Group> {
        let songPromises = songs.map(this.generateArtist);
        let group = new fabric.Group();
        let songGroups = await Promise.all(songPromises);
        if (songGroups.length > 0) {
          songGroups[0].set({
            left: 0
          });
          group.add(songGroups[0]);
        }
        if (songGroups.length > 1) {
          songGroups[1].set({
            left: ALBUM_IMAGE_SIZE+10
          });
          group.add(songGroups[1]);
        }
        if (songGroups.length > 2) {
          songGroups[2].set({
            left: ALBUM_IMAGE_SIZE*2+20
          });
          group.add(songGroups[2]);
        }

        group.add(new fabric.Rect({
          width:ALBUM_IMAGE_SIZE*3+20,
          fill: 'transparent',
          stroke: 'transparent'
        }))
        
        group.addWithUpdate();
        return group;
      }
    },
    computed: {
      topSongs: function(): Array<SpotifyUserPair> {
        const songs = this['$props'].results.songs;
        if (songs.length < 4) {
          return songs;
        }
        let top: Array<SpotifyUserPair> = [];
        let albumIds: Array<string> = [];
        let sortedResults = songs.slice();//.sort((a,b) => (a.npr['rank'] > b.npr['rank']) ? 1 : -1);

        let firstSong = sortedResults.shift();
        top.push(firstSong as SpotifyUserPair);
        albumIds.push((firstSong as SpotifyUserPair).user.album.id);

        let secondSong = sortedResults.find((song: any) => !albumIds.includes(song.user.album.id));
        if (secondSong == undefined) {
          top.push(sortedResults.shift() as SpotifyUserPair);
        }
        else {
          top.push(secondSong);
          albumIds.push(secondSong.user.album.id);
          sortedResults.splice(sortedResults.indexOf(secondSong), 1);
        }

        let thirdSong = sortedResults.find((song: any) => !albumIds.includes(song.user.album.id));
        if (thirdSong == undefined) {
          top.push(sortedResults.shift() as SpotifyUserPair);
        }
        else {
          top.push(thirdSong);
          albumIds.push(thirdSong.user.album.id);
          sortedResults.splice(sortedResults.indexOf(thirdSong), 1);
        }

        return top;
      },

      topArtists: function(): Array<ArtistUserPair> {
        const artists = this['$props'].results.artists;//.slice().sort((a,b) => (a.npr['rank'] > b.npr['rank']) ? 1 : -1);
        return artists.slice(0, 3);
      }
    }
  }
</script>

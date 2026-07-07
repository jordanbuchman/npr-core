export interface PlaylistList {
  /** List identifier, e.g. "2014songs". */
  list: string
  /** Spotify playlist id (NPR Music's year-end playlist embedded on the page). */
  playlistId: string
}

// Years whose NPR pages are JS apps / mixed prose but embed an NPR Music
// Spotify playlist. We pull the exact tracks from the playlist instead of
// scraping HTML. (The playlist id is in the page — search for
// "open.spotify.com/user/npr_music/playlist".)
export const PLAYLISTS: PlaylistList[] = [
  { list: '2011songs', playlistId: '0CuUS9Pepg0mEi7raYX926' },
  { list: '2012songs', playlistId: '7ro9wf8vuSLGxStaC8t8Rv' },
  { list: '2014songs', playlistId: '7smLrFGGXClJdQVTr7vxoZ' },
  { list: '2015songs', playlistId: '2ix23XaPdGiuapiWb2vp0j' },
]

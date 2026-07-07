import { parseStrongEmAlbums } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2012albums'

// Older blog format: <strong>ARTIST<br><em>Album</em></strong>.
const URL =
  'https://www.npr.org/blogs/bestmusic2012/2012/11/30/166230912/npr-musics-50-favorite-albums-of-2012'

export async function scrape(): Promise<RawRanking[]> {
  const html = await fetch(URL).then((res) => res.text())
  return parseStrongEmAlbums(html, list)
}

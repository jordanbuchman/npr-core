import { parseStrongEmAlbums } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2014albums'

// Older blog format: <strong>ARTIST<br><em>Album</em></strong>.
const URL = 'https://www.npr.org/2014/12/08/368731400/npr-musics-50-favorite-albums-of-2014'

export async function scrape(): Promise<RawRanking[]> {
  const html = await fetch(URL).then((res) => res.text())
  return parseStrongEmAlbums(html, list)
}

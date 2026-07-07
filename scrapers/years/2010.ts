import { parseNumberedList } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2010albums'

// 2010 has no best-songs list; its "complete list" is numbered "N. Artist,
// Album" album entries (main 50 + genre sub-lists). Best-effort album grab.
const URL = 'https://www.npr.org/2010/12/27/131728902/best-music-of-2010-the-complete-list'

export async function scrape(): Promise<RawRanking[]> {
  const html = await fetch(URL).then((res) => res.text())
  return parseNumberedList(html, list, 'album')
}

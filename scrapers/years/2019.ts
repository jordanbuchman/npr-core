import { parseQuotedSongs } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2019songs'

// Single page, <h3> artist + <h3> "title" pairs. (Resolved from the
// best-music-of-2019 hub.)
const URL = 'https://www.npr.org/2019/12/11/778226410/the-25-best-songs-of-2019'

export async function scrape(): Promise<RawRanking[]> {
  const html = await fetch(URL).then((res) => res.text())
  return parseQuotedSongs(html, list)
}

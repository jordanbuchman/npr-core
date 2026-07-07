import { parseQuotedSongs, scrapePaginated } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2020songs'

// <h3> artist + <h3> "title" pairs; page 1 links to the rest. (Resolved from
// the best-music-of-2020 hub.)
const FIRST_PAGE = 'https://www.npr.org/2020/12/03/931771524/the-100-best-songs-of-2020-page-1'

export function scrape(): Promise<RawRanking[]> {
  return scrapePaginated(FIRST_PAGE, (html) => parseQuotedSongs(html, list))
}

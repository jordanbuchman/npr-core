import { parseQuotedSongs, scrapePaginated } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2022songs'

// <h3> artist + <h3> "title" pairs; page 1 links to the rest.
const FIRST_PAGE = 'https://www.npr.org/2022/12/15/1135802083/100-best-songs-2022-page-1'

export function scrape(): Promise<RawRanking[]> {
  return scrapePaginated(FIRST_PAGE, (html) => parseQuotedSongs(html, list))
}

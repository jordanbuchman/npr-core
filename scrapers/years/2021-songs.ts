import { parseQuotedSongs, scrapePaginated } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2021songs'

// Alphabetical: <h3> artist + <h3> "title"; page 1 links to the rest.
const FIRST_PAGE = 'https://www.npr.org/2021/12/02/1054377950/the-100-best-songs-of-2021-page-1'

export function scrape(): Promise<RawRanking[]> {
  return scrapePaginated(FIRST_PAGE, (html) => parseQuotedSongs(html, list))
}

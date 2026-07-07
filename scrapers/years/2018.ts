import { parseQuotedSongs, scrapePaginated } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2018songs'

// Paginated prose; page 1 links to the rest. (Resolved from the
// best-music-of-2018 hub.)
const FIRST_PAGE = 'https://www.npr.org/2018/12/05/671206143/the-100-best-songs-of-2018-page-1'

export function scrape(): Promise<RawRanking[]> {
  return scrapePaginated(FIRST_PAGE, (html) => parseQuotedSongs(html, list))
}

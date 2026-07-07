import { parseRankedQuoted, scrapePaginated } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2017songs'

// Ranked `N. Artist"Title"` countdown; page 1 links to the rest.
// (Resolved from the best-music-of-2017 hub.)
const FIRST_PAGE = 'https://www.npr.org/2017/12/13/568725030/the-100-best-songs-of-2017'

export function scrape(): Promise<RawRanking[]> {
  return scrapePaginated(FIRST_PAGE, (html) => parseRankedQuoted(html, list))
}

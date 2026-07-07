import { parseAlbumPairs, scrapePaginated } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2021albums'

// <h3> artist + <h3> album title (unquoted); page 1 links to the rest.
const FIRST_PAGE = 'https://www.npr.org/2021/12/01/1054318397/the-50-best-albums-of-2021-page-1'

export function scrape(): Promise<RawRanking[]> {
  return scrapePaginated(FIRST_PAGE, (html) => parseAlbumPairs(html, list))
}

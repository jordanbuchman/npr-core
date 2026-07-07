import { parseAlbumPairs, scrapePaginated } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2022albums'

// <h3> artist + <h3> album pairs; page 1 links to the rest.
const FIRST_PAGE = 'https://www.npr.org/2022/12/12/1134898067/50-best-albums-2022-page-1'

export function scrape(): Promise<RawRanking[]> {
  return scrapePaginated(FIRST_PAGE, (html) => parseAlbumPairs(html, list))
}

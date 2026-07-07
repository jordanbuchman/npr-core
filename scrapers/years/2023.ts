import { scrapeBestSongsApp } from '../lib/dailygraphics'
import type { RawRanking } from '../lib/types'

export const list = '2023songs'

// Find this by searching the npr.org article for "apps.npr.org/dailygraphics".
const APP_URL = 'https://apps.npr.org/dailygraphics/graphics/best-songs-2023-20231106/'

export function scrape(): Promise<RawRanking[]> {
  return scrapeBestSongsApp(APP_URL, list)
}

import { parseQuotedSongs } from '../lib/prose'
import type { RawRanking } from '../lib/types'

export const list = '2025songs'

// Single-page, server-rendered prose: <h2> artist + <p> "title".
const URL = 'https://www.npr.org/2025/12/09/nx-s1-5619849/best-songs-of-2025'

export async function scrape(): Promise<RawRanking[]> {
  const html = await fetch(URL).then((res) => res.text())
  return parseQuotedSongs(html, list)
}

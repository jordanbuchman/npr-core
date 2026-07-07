import * as cheerio from 'cheerio'
import { stripQuotes } from './text'
import type { RawRanking } from './types'

/**
 * Scrapes an NPR "best songs" dailygraphics app, e.g.
 * `apps.npr.org/dailygraphics/graphics/best-songs-2024-.../`. The npr.org
 * article embeds this app via JS, so we scrape the app's own (server-rendered)
 * HTML. Each entry exposes `.artist` and `.title`; these lists are alphabetical,
 * so entries are unranked.
 */
export async function scrapeBestSongsApp(appUrl: string, list: string): Promise<RawRanking[]> {
  const html = await fetch(appUrl).then((res) => res.text())
  const $ = cheerio.load(html)

  const rankings: RawRanking[] = []
  $('.review').each((_, el) => {
    const artist = $(el).find('.artist').first().text().trim()
    const title = stripQuotes($(el).find('.title').first().text())
    if (artist && title) {
      rankings.push({ artist, title, list, kind: 'song', ranked: false, rank: 0 })
    }
  })

  if (rankings.length === 0) {
    console.warn(`[${list}] no entries parsed — the markup at ${appUrl} may have changed`)
  }
  return rankings
}

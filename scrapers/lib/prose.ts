import * as cheerio from 'cheerio'
import { cleanText, stripQuotes } from './text'
import type { RawRanking } from './types'

const STARTS_WITH_QUOTE = /^[“"']/

/**
 * Song lists where each entry is an artist heading followed by a quoted title
 * (in a heading or paragraph). Walks the story body in order, pairing each
 * artist heading with the next quoted element. Unranked (these lists are
 * alphabetical). Used by the 2021 and 2025 best-songs pages.
 */
export function parseQuotedSongs(html: string, list: string): RawRanking[] {
  const $ = cheerio.load(html)
  const out: RawRanking[] = []
  let artist: string | null = null

  $('#storytext')
    .find('h2, h3, h4, p')
    .each((_, el) => {
      const $el = $(el)
      const text = cleanText($el.text())
      if (!text) return
      if (STARTS_WITH_QUOTE.test(text)) {
        if (artist) {
          out.push({ artist, title: stripQuotes(text), list, kind: 'song', ranked: false, rank: 0 })
          artist = null
        }
      } else if ($el.is('h2, h3, h4')) {
        artist = text
      }
    })

  return out
}

/**
 * Album lists rendered as alternating artist / album-title headings (album
 * titles are not quoted). Used by the 2021 best-albums page.
 */
export function parseAlbumPairs(html: string, list: string): RawRanking[] {
  const $ = cheerio.load(html)
  const headings = $('#storytext')
    .find('h3')
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter(Boolean)

  const out: RawRanking[] = []
  for (let i = 0; i + 1 < headings.length; i += 2) {
    const artist = headings[i]
    const title = headings[i + 1]
    if (artist && title) {
      out.push({ artist, title: stripQuotes(title), list, kind: 'album', ranked: false, rank: 0 })
    }
  }
  return out
}

/**
 * Ranked countdowns rendered as `N. Artist"Title"` headings — the quote splits
 * artist from title. Used by the 2017-era best-songs pages.
 */
export function parseRankedQuoted(html: string, list: string): RawRanking[] {
  const $ = cheerio.load(html)
  const out: RawRanking[] = []
  const entry = /^(\d+)\.\s*(.+?)[“"](.+?)[”"]/
  $('#storytext')
    .find('h3, p')
    .each((_, el) => {
      const match = entry.exec(cleanText($(el).text()))
      if (match) {
        out.push({
          artist: match[2]!.trim(),
          title: match[3]!.trim(),
          list,
          kind: 'song',
          ranked: true,
          rank: Number(match[1]),
        })
      }
    })
  return out
}

/**
 * Numbered "N. Artist, Title" list items (comma-delimited). Used by the 2010
 * complete list, which concatenates several album sub-lists; treated as
 * unranked. Bad artist/title splits simply fail the later Spotify lookup and
 * are dropped, so this is safe as a best-effort grab.
 */
export function parseNumberedList(
  html: string,
  list: string,
  kind: 'song' | 'album',
): RawRanking[] {
  const $ = cheerio.load(html)
  const out: RawRanking[] = []
  const entry = /^\d+\.\s+(.+?),\s+(.+)$/
  $('#storytext')
    .find('p')
    .each((_, el) => {
      const match = entry.exec(cleanText($(el).text()))
      if (match) {
        out.push({
          artist: match[1]!.trim(),
          title: match[2]!.trim(),
          list,
          kind,
          ranked: false,
          rank: 0,
        })
      }
    })
  return out
}

/**
 * Album lists in the older NPR blog format:
 * `<p><strong>ARTIST<br><em>Album</em></strong></p>`. The artist is the
 * `<strong>`'s own text and the album is its nested `<em>` — so the two never
 * misalign. Used by the 2012–2015 best-albums articles.
 */
export function parseStrongEmAlbums(html: string, list: string): RawRanking[] {
  const $ = cheerio.load(html)
  const out: RawRanking[] = []
  $('#storytext')
    .find('strong')
    .each((_, el) => {
      const $strong = $(el)
      const em = $strong.find('em').first()
      if (!em.length) return
      const title = cleanText(em.text())
      const artist = cleanText(
        $strong
          .contents()
          .filter((_, node) => node.type === 'text')
          .text(),
      )
      if (artist && title) {
        out.push({ artist, title, list, kind: 'album', ranked: false, rank: 0 })
      }
    })
  return out
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Scrapes a multi-page NPR list. NPR paginates by publishing each page as a
 * separate story with its own id, so we can't guess page URLs — instead we
 * parse page 1, then follow the `…-page-N` links it contains to the rest.
 * De-dupes by artist+title.
 */
export async function scrapePaginated(
  firstPageUrl: string,
  parse: (html: string) => RawRanking[],
): Promise<RawRanking[]> {
  const firstHtml = await fetch(firstPageUrl).then((res) => res.text())

  const all: RawRanking[] = []
  const seen = new Set<string>()
  const add = (entries: RawRanking[]) => {
    for (const entry of entries) {
      const key = `${entry.artist}|${entry.title}`.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      all.push(entry)
    }
  }
  add(parse(firstHtml))

  // Discover sibling pages (page 2+) from page 1's own pagination links.
  const slugBase = (new URL(firstPageUrl).pathname.split('/').pop() ?? '').replace(/-page-\d+$/, '')
  const linkRe = new RegExp(`href="([^"]*${escapeRegExp(slugBase)}-page-(\\d+))"`, 'g')
  const pages = new Map<number, string>()
  for (const match of firstHtml.matchAll(linkRe)) {
    const n = Number(match[2])
    if (n > 1) pages.set(n, new URL(match[1]!, firstPageUrl).toString())
  }

  for (const n of [...pages.keys()].sort((a, b) => a - b)) {
    const response = await fetch(pages.get(n)!)
    if (response.ok) add(parse(await response.text()))
  }
  return all
}

import type { RawRanking } from '../lib/types'
import * as y2010 from './2010'
import * as y2017 from './2017'
import * as y2018 from './2018'
import * as y2019 from './2019'
import * as y2020 from './2020'
import * as y2021albums from './2021-albums'
import * as y2021songs from './2021-songs'
import * as y2012albums from './2012-albums'
import * as y2014albums from './2014-albums'
import * as y2022 from './2022'
import * as y2022albums from './2022-albums'
import * as y2023 from './2023'
import * as y2024 from './2024'
import * as y2025 from './2025'

export interface YearScraper {
  /** List identifier, e.g. "2024songs" or "2021albums". */
  list: string
  scrape: () => Promise<RawRanking[]>
}

// Add a module per NPR ranking list here as you build them out.
export const scrapers: YearScraper[] = [
  y2010,
  y2012albums,
  y2014albums,
  y2017,
  y2018,
  y2019,
  y2020,
  y2021songs,
  y2021albums,
  y2022,
  y2022albums,
  y2023,
  y2024,
  y2025,
]

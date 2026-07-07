// Pure scoring/verdict helpers. Kept free of Nuxt/Vue imports so they can be
// unit-tested in isolation. Auto-imported across the app via Nuxt's utils dir.

// Empirical CDF seed: the percentile (0–100) that a *raw* score of i/100 falls
// at, among users who scored above 0. Index 0 = raw 0.00 … index 100 = raw 1.00.
// Seeded from the original NPRcore distribution; regenerate from real data
// (e.g. the `nprcore_score` analytics events) and replace this array over time.
const CDF = [
  0, 3, 4, 5, 6, 8, 10, 11, 13, 15, 17, 20, 22, 25, 27, 30, 33, 36, 39, 41, 44, 47, 50, 53, 56, 59,
  61, 64, 67, 69, 71, 74, 76, 78, 80, 82, 83, 85, 87, 88, 89, 90, 92, 93, 93, 94, 95, 96, 96, 97,
  97, 98, 98, 98, 98, 99, 99, 99, 99, 99, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
]

const VERDICTS = [
  'No Things Considered',
  'Obama is your favorite president',
  'You probably say you like "indie music"',
  'You own at least one NPR tote bag',
  "You're literally Ira Glass",
]

// Easter egg: the final verdict changes when arriving with `?state=correct`.
const VERDICTS_ALT = [...VERDICTS.slice(0, -1), "You're literally Patrick Murray"]

/**
 * Raw NPRcore score: the fraction of your sampled top music that NPR recommends
 * (precision), in [0, 1]. Disjoint from NPR → 0; entirely NPR-recommended → 1;
 * monotonic in the number of matches.
 */
export function rawScore(matches: number, sampled: number): number {
  if (sampled <= 0) return 0
  return Math.min(Math.max(matches / sampled, 0), 1)
}

/**
 * Final 0–100 score: where a raw score lands on the empirical CDF of users who
 * scored above 0 ("more NPRcore than N% of listeners"). A raw 0 stays 0; any
 * positive score floors at 1 so a real match never displays as 0.
 */
export function finalScore(raw: number): number {
  if (raw <= 0) return 0
  const index = Math.min(Math.max(Math.round(raw * (CDF.length - 1)), 0), CDF.length - 1)
  return Math.max(1, CDF[index] ?? 100)
}

/** Maps a 0–100 final score to a verdict string. */
export function verdictFromScore(score: number, alt = false): string {
  const verdicts = alt ? VERDICTS_ALT : VERDICTS
  const index = Math.min(Math.floor((verdicts.length * score) / 100), verdicts.length - 1)
  return verdicts[index] ?? verdicts[0] ?? ''
}

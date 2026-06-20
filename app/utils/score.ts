// Pure scoring/verdict helpers. Kept free of Nuxt/Vue imports so they can be
// unit-tested in isolation. Auto-imported across the app via Nuxt's utils dir.

// Maps a match count (0–100) to an "NPRcore" percentile (0–100).
const PERCENTILES = [
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

/** Returns the NPRcore score as a 0–1 fraction for a given number of matches. */
export function scoreFromMatches(matchCount: number): number {
  const index = Math.min(Math.max(Math.trunc(matchCount), 0), PERCENTILES.length - 1)
  return (PERCENTILES[index] ?? 100) / 100
}

/** Maps a 0–1 score to a verdict string. */
export function verdictFromScore(score: number, alt = false): string {
  const verdicts = alt ? VERDICTS_ALT : VERDICTS
  const index = Math.min(Math.floor(verdicts.length * score), verdicts.length - 1)
  return verdicts[index] ?? verdicts[0] ?? ''
}

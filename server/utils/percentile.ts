/**
 * Empirical-CDF percentile of `value` within `population` (midpoint rank):
 * the fraction of the population below `value`, counting ties as half. Returns a
 * value in [0, 1]; an empty population returns 0.
 */
export function percentileRank(value: number, population: number[]): number {
  if (population.length === 0) return 0
  let below = 0
  let equal = 0
  for (const other of population) {
    if (other < value) below++
    else if (other === value) equal++
  }
  return (below + equal / 2) / population.length
}

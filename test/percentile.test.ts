import { describe, expect, it } from 'vitest'
import { percentileRank } from '../server/utils/percentile'

describe('percentileRank', () => {
  it('is 0 for an empty population', () => {
    expect(percentileRank(0.5, [])).toBe(0)
  })

  it('is 0.5 for the sole member (midpoint of itself)', () => {
    expect(percentileRank(0.3, [0.3])).toBe(0.5)
  })

  it('counts values below plus half of ties', () => {
    // 2 below, 1 equal (itself) of 5 → (2 + 0.5) / 5
    expect(percentileRank(0.5, [0.1, 0.2, 0.5, 0.8, 0.9])).toBeCloseTo(0.5)
  })

  it('ranks the maximum near the top', () => {
    expect(percentileRank(0.9, [0.1, 0.2, 0.9])).toBeCloseTo((2 + 0.5) / 3)
  })

  it('is monotonic in the value', () => {
    const population = [0.1, 0.3, 0.5, 0.7]
    expect(percentileRank(0.2, population)).toBeLessThan(percentileRank(0.6, population))
  })
})

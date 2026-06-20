import { describe, expect, it } from 'vitest'
import { scoreFromMatches, verdictFromScore } from '../app/utils/score'

describe('scoreFromMatches', () => {
  it('returns 0 with no matches', () => {
    expect(scoreFromMatches(0)).toBe(0)
  })

  it('maps a match count to its percentile fraction', () => {
    expect(scoreFromMatches(1)).toBeCloseTo(0.03)
    expect(scoreFromMatches(100)).toBe(1)
  })

  it('clamps counts outside the supported range', () => {
    expect(scoreFromMatches(-5)).toBe(0)
    expect(scoreFromMatches(999)).toBe(1)
  })
})

describe('verdictFromScore', () => {
  it('returns the lowest verdict at the bottom of the range', () => {
    expect(verdictFromScore(0)).toBe('No Things Considered')
  })

  it('returns the top verdict at the top of the range', () => {
    expect(verdictFromScore(1)).toBe("You're literally Ira Glass")
  })

  it('swaps the final verdict for the easter egg', () => {
    expect(verdictFromScore(1, true)).toBe("You're literally Patrick Murray")
  })
})

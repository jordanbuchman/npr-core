import { describe, expect, it } from 'vitest'
import { finalScore, rawScore, verdictFromScore } from '../app/utils/score'

describe('rawScore', () => {
  it('is 0 when your music is disjoint from NPR', () => {
    expect(rawScore(0, 100)).toBe(0)
  })

  it('is 1 when all your sampled music is NPR-recommended', () => {
    expect(rawScore(50, 50)).toBe(1)
  })

  it('is the matched fraction (precision)', () => {
    expect(rawScore(10, 100)).toBeCloseTo(0.1)
  })

  it('handles an empty sample without dividing by zero', () => {
    expect(rawScore(0, 0)).toBe(0)
  })

  it('clamps to [0, 1]', () => {
    expect(rawScore(150, 100)).toBe(1)
  })
})

describe('finalScore', () => {
  it('keeps a raw 0 at 0', () => {
    expect(finalScore(0)).toBe(0)
  })

  it('maps a full raw score to 100', () => {
    expect(finalScore(1)).toBe(100)
  })

  it('floors any positive score at 1', () => {
    expect(finalScore(0.0001)).toBeGreaterThanOrEqual(1)
  })

  it('is monotonic', () => {
    expect(finalScore(0.5)).toBeLessThanOrEqual(finalScore(0.8))
  })
})

describe('verdictFromScore', () => {
  it('returns the lowest verdict at 0', () => {
    expect(verdictFromScore(0)).toBe('No Things Considered')
  })

  it('returns the top verdict at 100', () => {
    expect(verdictFromScore(100)).toBe("You're literally Ira Glass")
  })

  it('swaps the final verdict for the easter egg', () => {
    expect(verdictFromScore(100, true)).toBe("You're literally Patrick Murray")
  })
})

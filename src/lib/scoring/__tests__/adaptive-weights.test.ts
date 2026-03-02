import { describe, expect, it } from 'vitest'
import { getAdaptiveWeights } from '@/lib/scoring/adaptive-weights'

describe('getAdaptiveWeights', () => {
  it('includes onchain weight for blockchain and normalizes to 1', () => {
    const weights = getAdaptiveWeights('blockchain', 500, 0.8)
    const total =
      weights.github +
      weights.community +
      weights.jobs +
      weights.ecosystem +
      (weights.onchain ?? 0)

    expect(weights.onchain).toBeDefined()
    expect(weights.onchain!).toBeGreaterThan(0)
    expect(total).toBeCloseTo(1, 8)
  })

  it('keeps non-blockchain categories 4-dimensional and normalized', () => {
    const weights = getAdaptiveWeights('frontend', 500, 0.8)
    const total =
      weights.github + weights.community + weights.jobs + weights.ecosystem

    expect(weights.onchain).toBeUndefined()
    expect(total).toBeCloseTo(1, 8)
  })
})


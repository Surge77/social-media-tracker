import { describe, expect, it } from 'vitest'
import { computeCompositeScore } from '@/lib/scoring/composite'
import { getAdaptiveWeights } from '@/lib/scoring/adaptive-weights'

describe('computeCompositeScore', () => {
  it('changes blockchain composite when onchain score changes', () => {
    const weights = getAdaptiveWeights('blockchain', 500, 0.9)
    const base = {
      github: 60,
      community: 60,
      jobs: 60,
      ecosystem: 60,
    }

    const lowOnchain = computeCompositeScore(
      { ...base, onchain: 0 },
      weights,
      'blockchain'
    )
    const highOnchain = computeCompositeScore(
      { ...base, onchain: 100 },
      weights,
      'blockchain'
    )

    expect(highOnchain.composite).toBeGreaterThan(lowOnchain.composite)
  })
})


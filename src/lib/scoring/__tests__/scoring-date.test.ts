import { describe, expect, it } from 'vitest'
import {
  getTargetDateDaysAgo,
  pickCanonicalScoringDate,
} from '@/lib/scoring/scoring-date'

describe('scoring-date helpers', () => {
  it('prefers latest complete scoring date when present', () => {
    expect(
      pickCanonicalScoringDate('2026-03-02', '2026-03-01')
    ).toBe('2026-03-01')
  })

  it('falls back to latest score date when no complete date exists', () => {
    expect(
      pickCanonicalScoringDate('2026-03-02', null)
    ).toBe('2026-03-02')
  })

  it('computes prior target date by days', () => {
    expect(getTargetDateDaysAgo('2026-03-02', 7)).toBe('2026-02-23')
  })
})


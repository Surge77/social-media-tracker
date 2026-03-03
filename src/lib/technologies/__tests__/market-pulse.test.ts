import { describe, expect, it } from 'vitest'
import { selectCoolingEntry } from '@/lib/technologies/market-pulse'

type Entry = {
  technology_id: string
  momentum: number
  score_delta: number
}

describe('market pulse cooling selection', () => {
  it('returns most negative delta when previous-score data exists', () => {
    const entries: Entry[] = [
      { technology_id: 'a', momentum: 4, score_delta: 2.1 },
      { technology_id: 'b', momentum: -1, score_delta: -3.2 },
      { technology_id: 'c', momentum: 2, score_delta: -1.1 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: true })
    expect(cooling?.technology_id).toBe('b')
  })

  it('falls back to lowest delta when all deltas are non-negative', () => {
    const entries: Entry[] = [
      { technology_id: 'a', momentum: 4, score_delta: 1.2 },
      { technology_id: 'b', momentum: -1, score_delta: 0.0 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: true })
    expect(cooling?.technology_id).toBe('b')
  })

  it('falls back to negative momentum when previous data is unavailable', () => {
    const entries: Entry[] = [
      { technology_id: 'a', momentum: 4, score_delta: 0 },
      { technology_id: 'b', momentum: -6, score_delta: 0 },
      { technology_id: 'c', momentum: -2, score_delta: 0 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: false })
    expect(cooling?.technology_id).toBe('b')
  })

  it('falls back to lowest momentum when no negative momentum exists', () => {
    const entries: Entry[] = [
      { technology_id: 'a', momentum: 1, score_delta: 0 },
      { technology_id: 'b', momentum: 0.2, score_delta: 0 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: false })
    expect(cooling?.technology_id).toBe('b')
  })
})

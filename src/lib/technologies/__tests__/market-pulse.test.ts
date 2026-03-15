import { describe, expect, it } from 'vitest'
import {
  selectCoolingEntry,
  selectHiddenGemEntry,
  selectHottestEntry,
  selectTopScoreEntry,
} from '@/lib/technologies/market-pulse'

type Entry = {
  technology_id: string
  composite_score: number
  momentum: number
  score_delta: number
}

describe('market pulse cooling selection', () => {
  it('returns most negative delta when previous-score data exists', () => {
    const entries: Entry[] = [
      { technology_id: 'a', composite_score: 80, momentum: 4, score_delta: 2.1 },
      { technology_id: 'b', composite_score: 75, momentum: -1, score_delta: -3.2 },
      { technology_id: 'c', composite_score: 62, momentum: 2, score_delta: -1.1 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: true })
    expect(cooling?.technology_id).toBe('b')
  })

  it('falls back to lowest delta when all deltas are non-negative', () => {
    const entries: Entry[] = [
      { technology_id: 'a', composite_score: 83, momentum: 4, score_delta: 1.2 },
      { technology_id: 'b', composite_score: 77, momentum: -1, score_delta: 0.0 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: true })
    expect(cooling?.technology_id).toBe('b')
  })

  it('falls back to negative momentum when previous data is unavailable', () => {
    const entries: Entry[] = [
      { technology_id: 'a', composite_score: 81, momentum: 4, score_delta: 0 },
      { technology_id: 'b', composite_score: 58, momentum: -6, score_delta: 0 },
      { technology_id: 'c', composite_score: 64, momentum: -2, score_delta: 0 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: false })
    expect(cooling?.technology_id).toBe('b')
  })

  it('falls back to lowest momentum when no negative momentum exists', () => {
    const entries: Entry[] = [
      { technology_id: 'a', composite_score: 66, momentum: 1, score_delta: 0 },
      { technology_id: 'b', composite_score: 61, momentum: 0.2, score_delta: 0 },
    ]

    const cooling = selectCoolingEntry(entries, { hasPreviousData: false })
    expect(cooling?.technology_id).toBe('b')
  })
})

describe('market pulse distinct entry selection', () => {
  it('selects the highest overall score unless excluded', () => {
    const entries: Entry[] = [
      { technology_id: 'leader', composite_score: 96, momentum: 8, score_delta: 4.1 },
      { technology_id: 'runner-up', composite_score: 92, momentum: 7, score_delta: 3.9 },
    ]

    expect(selectTopScoreEntry(entries)?.technology_id).toBe('leader')
    expect(
      selectTopScoreEntry(entries, { excludeTechnologyIds: ['leader'] })?.technology_id
    ).toBe('runner-up')
  })

  it('selects hottest from the next strongest mover when top score is already used', () => {
    const entries: Entry[] = [
      { technology_id: 'leader', composite_score: 96, momentum: 9, score_delta: 5.6 },
      { technology_id: 'surging', composite_score: 72, momentum: 8, score_delta: 5.2 },
      { technology_id: 'steady', composite_score: 68, momentum: 3, score_delta: 1.1 },
    ]

    const hottest = selectHottestEntry(entries, {
      hasPreviousData: true,
      excludeTechnologyIds: ['leader'],
    })

    expect(hottest?.technology_id).toBe('surging')
  })

  it('keeps hidden gem distinct from hottest and top score', () => {
    const entries: Entry[] = [
      { technology_id: 'leader', composite_score: 94, momentum: 7, score_delta: 4.8 },
      { technology_id: 'hottest', composite_score: 73, momentum: 8, score_delta: 6.4 },
      { technology_id: 'gem', composite_score: 69, momentum: 5, score_delta: 5.1 },
      { technology_id: 'other', composite_score: 58, momentum: 2, score_delta: 2.2 },
    ]

    const hiddenGem = selectHiddenGemEntry(entries, {
      excludeTechnologyIds: ['leader', 'hottest'],
    })

    expect(hiddenGem?.technology_id).toBe('gem')
  })
})

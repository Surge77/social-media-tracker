import { describe, it, expect } from 'vitest'
import { computeDecisionSummary, computeWhatChanged } from '@/lib/insights'

describe('computeDecisionSummary', () => {
  it('returns Learn Now for high score + positive momentum + jobs', () => {
    const result = computeDecisionSummary(75, 8, 70, 65, 60, 68, 0.9, 'B')
    expect(result.career.verdict).toBe('Learn Now')
  })

  it('returns Watch when data completeness < 0.3', () => {
    const result = computeDecisionSummary(70, 8, 70, 65, 60, 68, 0.2, 'C')
    expect(result.career.verdict).toBe('Watch')
  })

  it('returns Low Priority for low score and low jobs', () => {
    const result = computeDecisionSummary(20, -2, 15, 18, 20, 22, 0.7, 'C')
    expect(result.career.verdict).toBe('Low Priority')
  })

  it('returns Adopt for mature ecosystem + good github + solid score', () => {
    const result = computeDecisionSummary(65, 4, 60, 58, 55, 62, 0.9, 'A')
    expect(result.stack.verdict).toBe('Adopt')
  })

  it('returns Wait for low ecosystem and low score', () => {
    const result = computeDecisionSummary(30, 1, 25, 28, 22, 18, 0.6, 'C')
    expect(result.stack.verdict).toBe('Wait')
  })

  it('includes low-confidence risk flag when grade is D', () => {
    const result = computeDecisionSummary(55, 5, 50, 48, 52, 50, 0.5, 'D')
    const hasConfidenceRisk = result.career.risks.some(r => r.toLowerCase().includes('confidence'))
    expect(hasConfidenceRisk).toBe(true)
  })

  it('career evidence has at most 3 items', () => {
    const result = computeDecisionSummary(75, 10, 80, 70, 75, 72, 0.95, 'A')
    expect(result.career.evidence.length).toBeLessThanOrEqual(3)
  })

  it('stack evidence has at most 3 items', () => {
    const result = computeDecisionSummary(75, 10, 80, 70, 75, 72, 0.95, 'A')
    expect(result.stack.evidence.length).toBeLessThanOrEqual(3)
  })

  it('career risks has at most 2 items', () => {
    const result = computeDecisionSummary(20, -15, 5, 10, 15, 10, 0.3, 'F')
    expect(result.career.risks.length).toBeLessThanOrEqual(2)
  })
})

describe('computeWhatChanged', () => {
  const makeChart = (days: number) =>
    Array.from({ length: days }, (_, i) => {
      const d = new Date('2026-01-01')
      d.setDate(d.getDate() + i)
      return {
        date: d.toISOString().split('T')[0],
        composite: 50 + i * 0.5,
        github: 45 + i * 0.3,
        community: 40 + i * 0.2,
        jobs: 55 + i * 0.1,
        ecosystem: 60 + i * 0.4,
      }
    })

  it('returns empty arrays for empty chart data', () => {
    const result = computeWhatChanged([])
    expect(result.period7d).toEqual([])
    expect(result.period30d).toEqual([])
    expect(result.topMover7d).toBeNull()
  })

  it('detects upward composite trend over 30 days', () => {
    const result = computeWhatChanged(makeChart(60))
    const delta = result.period30d.find(d => d.dimension === 'composite')
    expect(delta).toBeDefined()
    expect(delta?.direction).toBe('up')
  })

  it('topMover7d is the dimension with the largest absolute 7d delta', () => {
    const result = computeWhatChanged(makeChart(30))
    if (result.topMover7d && result.period7d.length > 0) {
      const maxDelta = Math.max(...result.period7d.map(d => Math.abs(d.delta)))
      expect(Math.abs(result.topMover7d.delta)).toBe(maxDelta)
    }
  })

  it('flat movements (<=1pt change) are excluded from results', () => {
    // Build chart where all values barely change (< 1pt total)
    const tinyChart = [
      { date: '2026-01-01', composite: 50.0, github: 50.0, community: 50.0, jobs: 50.0, ecosystem: 50.0 },
      { date: '2026-01-08', composite: 50.5, github: 50.5, community: 50.5, jobs: 50.5, ecosystem: 50.5 },
    ]
    const result = computeWhatChanged(tinyChart)
    // All deltas are 0.5 which is <= 1, so should be flat and excluded
    expect(result.period7d.every(d => d.direction !== 'flat')).toBe(true)
    expect(result.period7d.length).toBe(0)
  })
})

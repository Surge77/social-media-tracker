import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { evaluateScoringFixtureSet } from '@/lib/autoresearch/scoring-evaluator'

const fixturePath = path.resolve(
  process.cwd(),
  'autoresearch',
  'fixtures',
  'scoring',
  'baseline.json',
)

describe('scoring autoresearch evaluator', () => {
  it('passes the committed baseline fixture set with no failures', async () => {
    const report = await evaluateScoringFixtureSet(fixturePath)

    expect(report.track).toBe('scoring')
    expect(report.metric).toBe(100)
    expect(report.failures).toEqual([])
  })

  it('reports curated ranking plus deterministic sanity sections', async () => {
    const report = await evaluateScoringFixtureSet(fixturePath)

    expect(report.sections.map((section) => section.id)).toEqual([
      'weights',
      'momentum',
      'ranking',
    ])
  })
})

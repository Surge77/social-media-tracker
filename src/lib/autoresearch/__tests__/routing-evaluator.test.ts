import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { evaluateRoutingFixtureSet } from '@/lib/autoresearch/routing-evaluator'

const fixturePath = path.resolve(
  process.cwd(),
  'autoresearch',
  'fixtures',
  'routing',
  'baseline.json',
)

describe('routing autoresearch evaluator', () => {
  it('passes the committed replay fixture set with no failures', async () => {
    const report = await evaluateRoutingFixtureSet(fixturePath)

    expect(report.track).toBe('routing')
    expect(report.metric).toBe(100)
    expect(report.failures).toEqual([])
  })

  it('replays primary and fallback routing decisions deterministically', async () => {
    const report = await evaluateRoutingFixtureSet(fixturePath)

    const chatPrimary = report.cases.find((testCase) => testCase.id === 'chat_prefers_groq')
    const chatFallback = report.cases.find(
      (testCase) => testCase.id === 'chat_falls_back_to_cerebras',
    )

    expect(chatPrimary?.chosenProvider).toBe('groq')
    expect(chatFallback?.chosenProvider).toBe('cerebras')
  })
})

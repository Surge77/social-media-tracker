import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/quiz/ai-helper', () => ({
  generateQuizAI: vi.fn(),
  validateAIResponse: (r: string) => ({ valid: r.length > 10, reason: '' }),
  parseBulletPoints: (r: string) =>
    r.split('\n').filter((l: string) => l.startsWith('- ')).map((l: string) => l.slice(2)),
  getFallback: (_type: string) => 'Fallback reasoning text',
}))

import { analyzeHype } from '@/lib/quiz/hype-check-engine'
import { generateQuizAI } from '@/lib/quiz/ai-helper'
import type { QuizAnswer } from '@/lib/quiz/types'
import {
  hypedTechFixture,
  fadingTechFixture,
  realDealFixture,
  allFixtures,
} from './fixtures'

const mockGenerateQuizAI = vi.mocked(generateQuizAI)

beforeEach(() => {
  mockGenerateQuizAI.mockReset()
})

describe('analyzeHype', () => {
  describe('no technology selected', () => {
    it('returns empty recommendation when technology answer is missing', async () => {
      const result = await analyzeHype([], allFixtures)

      expect(result.primary.action).toBe('No technology selected')
      expect(mockGenerateQuizAI).not.toHaveBeenCalled()
    })
  })

  describe('technology not found', () => {
    it('returns not-found recommendation when slug not in tech list', async () => {
      const answers: QuizAnswer[] = [{ questionId: 'technology', value: 'unknown-tech-xyz' }]

      const result = await analyzeHype(answers, allFixtures)

      expect(result.primary.action).toContain('not found')
      expect(mockGenerateQuizAI).not.toHaveBeenCalled()
    })
  })

  describe('OVERHYPED verdict', () => {
    it('classifies tech as OVERHYPED when community >> jobs with low momentum', async () => {
      // hypedTechFixture: community=90, jobs=40, gap=50 > 40, momentum=2 < 5 → 'overhyped'
      mockGenerateQuizAI.mockResolvedValue(
        'This framework has massive buzz but limited employer adoption. Skip it if job hunting.'
      )

      const answers: QuizAnswer[] = [{ questionId: 'technology', value: 'hyped-framework' }]

      const result = await analyzeHype(answers, [hypedTechFixture, ...allFixtures])

      expect(result.primary.action).toBe('🎪 OVERHYPED')
      expect(result.primary.technology).toBe('hyped-framework')

      // Large hype gap → warnings present
      expect(result.warnings).toBeDefined()
      expect(result.warnings!.length).toBeGreaterThan(0)
      expect(result.warnings![0]).toContain('Large gap between buzz and jobs')
    })
  })

  describe('FADING verdict', () => {
    it('classifies tech as FADING when jobs > community and momentum is negative', async () => {
      // fadingTechFixture: community=30, jobs=50, gap=-20 < -10, momentum=-8 < -5 → 'fading'
      mockGenerateQuizAI.mockResolvedValue(
        'This technology is losing developer interest. Not recommended for new learning.'
      )

      const answers: QuizAnswer[] = [{ questionId: 'technology', value: 'fading-tech' }]

      const result = await analyzeHype(answers, [fadingTechFixture, ...allFixtures])

      expect(result.primary.action).toBe('📉 FADING')
      expect(result.primary.technology).toBe('fading-tech')
      // No large hype gap warning (gap is -20, hypeGap <= 40)
      expect(result.warnings).toBeUndefined()
    })
  })

  describe('REAL DEAL verdict', () => {
    it('classifies tech as REAL DEAL when scores are balanced with positive momentum', async () => {
      // realDealFixture: community=70, jobs=65, gap=5 |<15|, momentum=7 >5, composite=62 >50 → 'real'
      mockGenerateQuizAI.mockResolvedValue(
        'RealDeal shows balanced growth with real job opportunities. Safe to learn.'
      )

      const answers: QuizAnswer[] = [{ questionId: 'technology', value: 'real-deal' }]

      const result = await analyzeHype(answers, [realDealFixture, ...allFixtures])

      expect(result.primary.action).toBe('✅ REAL DEAL')
      expect(result.primary.technology).toBe('real-deal')
    })
  })

  describe('AI fallback on error', () => {
    it('falls back to template honest take when AI call throws', async () => {
      mockGenerateQuizAI.mockRejectedValue(new Error('AI provider unavailable'))

      const answers: QuizAnswer[] = [{ questionId: 'technology', value: 'hyped-framework' }]

      // Should not throw
      const result = await analyzeHype(answers, [hypedTechFixture, ...allFixtures])

      expect(result.primary.action).toBe('🎪 OVERHYPED')
      // nextSteps[0] is honestTake — should contain template text
      expect(result.nextSteps[0]).toContain('HypedFramework')
      expect(result.nextSteps.length).toBeGreaterThan(1)
    })
  })

  describe('response shape', () => {
    it('always returns required QuizRecommendation fields', async () => {
      mockGenerateQuizAI.mockResolvedValue('Solid honest take about this technology.')

      const answers: QuizAnswer[] = [{ questionId: 'technology', value: 'real-deal' }]

      const result = await analyzeHype(answers, [realDealFixture])

      expect(result.primary).toBeDefined()
      expect(result.primary.action).toBeTruthy()
      expect(result.primary.reasoning).toBeInstanceOf(Array)
      expect(result.nextSteps).toBeInstanceOf(Array)
      expect(result.relatedLinks).toBeInstanceOf(Array)
      // relatedLinks always has 4 entries for a found tech
      expect(result.relatedLinks.length).toBeGreaterThanOrEqual(4)
    })
  })
})

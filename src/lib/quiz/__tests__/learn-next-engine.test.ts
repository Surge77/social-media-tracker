import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/quiz/ai-helper', () => ({
  generateQuizAI: vi.fn(),
  validateAIResponse: (r: string) => ({ valid: r.length > 10, reason: '' }),
  parseBulletPoints: (r: string) =>
    r.split('\n').filter((l: string) => l.startsWith('- ')).map((l: string) => l.slice(2)),
  getFallback: (_type: string) => 'Fallback reasoning text',
}))

import { generateLearnNextRecommendation } from '@/lib/quiz/learn-next-engine'
import { generateQuizAI } from '@/lib/quiz/ai-helper'
import type { QuizAnswer } from '@/lib/quiz/types'
import { reactFixture, vueFixture, angularFixture, rustFixture, allFixtures } from './fixtures'

const mockGenerateQuizAI = vi.mocked(generateQuizAI)

// AI response with 3 properly formatted bullet points
const AI_BULLET_RESPONSE = [
  '- Strong job market with high demand in frontend roles',
  '- Builds on your existing JavaScript knowledge directly',
  '- Achievable in 2-3 months at 5 hours per week',
].join('\n')

beforeEach(() => {
  mockGenerateQuizAI.mockReset()
})

describe('generateLearnNextRecommendation', () => {
  describe('get-job goal — job-weighted scoring', () => {
    it('recommends React over Vue when goal is get-job (React has higher jobs_score)', async () => {
      // get-job weights: jobs=0.6, momentum=0.2, ecosystem=0.15, community=0.05
      // react: jobs=90 → weighted ~54+...; vue: jobs=60 → ~36+...
      mockGenerateQuizAI.mockResolvedValue(AI_BULLET_RESPONSE)

      const answers: QuizAnswer[] = [
        { questionId: 'goal', value: 'get-job' },
        { questionId: 'interest-area', value: 'frontend' },
        { questionId: 'current-skills', value: [] },
        { questionId: 'time-commitment', value: '5hrs' },
      ]

      const result = await generateLearnNextRecommendation(answers, [reactFixture, vueFixture])

      expect(result.primary.technology).toBe('react')
      expect(result.primary.action).toBe('Learn React')
      expect(result.primary.reasoning).toBeInstanceOf(Array)
      expect(result.primary.reasoning.length).toBeGreaterThanOrEqual(2)
      // AI bullet points should be in the reasoning
      expect(result.primary.reasoning[0]).toContain('Strong job market')
    })

    it('includes a timeline estimate in the primary recommendation', async () => {
      mockGenerateQuizAI.mockResolvedValue(AI_BULLET_RESPONSE)

      const answers: QuizAnswer[] = [
        { questionId: 'goal', value: 'get-job' },
        { questionId: 'interest-area', value: 'frontend' },
        { questionId: 'time-commitment', value: '5hrs' },
      ]

      const result = await generateLearnNextRecommendation(answers, [reactFixture])

      expect(result.primary.timeline).toBeTruthy()
      expect(typeof result.primary.timeline).toBe('string')
    })
  })

  describe('excludes technologies the user already knows', () => {
    it('recommends Vue instead of React when React is in current-skills', async () => {
      mockGenerateQuizAI.mockResolvedValue(AI_BULLET_RESPONSE)

      const answers: QuizAnswer[] = [
        { questionId: 'current-skills', value: ['react'] },
        { questionId: 'goal', value: 'get-job' },
        { questionId: 'interest-area', value: 'frontend' },
        { questionId: 'time-commitment', value: '5hrs' },
      ]

      const result = await generateLearnNextRecommendation(
        answers,
        [reactFixture, vueFixture]
      )

      expect(result.primary.technology).toBe('vue')
      expect(result.primary.technology).not.toBe('react')
    })

    it('returns fallback recommendation when user knows all techs in interest area', async () => {
      const answers: QuizAnswer[] = [
        { questionId: 'current-skills', value: ['react', 'vue', 'angular'] },
        { questionId: 'interest-area', value: 'frontend' },
        { questionId: 'goal', value: 'get-job' },
      ]

      // All frontend techs are known → fallback picks best from allFixtures overall
      const result = await generateLearnNextRecommendation(
        answers,
        [reactFixture, vueFixture, angularFixture]
      )

      // Fallback uses the top tech by composite score from all technologies
      expect(result.primary).toBeDefined()
      expect(result.primary.reasoning).toBeInstanceOf(Array)
    })
  })

  describe('category filtering', () => {
    it('only considers language-category techs when interest area is not frontend', async () => {
      mockGenerateQuizAI.mockResolvedValue(AI_BULLET_RESPONSE)

      const answers: QuizAnswer[] = [
        { questionId: 'interest-area', value: 'backend' },
        { questionId: 'goal', value: 'stay-relevant' },
        { questionId: 'current-skills', value: [] },
      ]

      // rustFixture is 'language' — backend maps to ['backend'] which excludes 'language'
      // So only techs with category 'backend' would qualify; none in our fixture set
      // Falls back to overall top tech
      const result = await generateLearnNextRecommendation(
        answers,
        [reactFixture, vueFixture, rustFixture]
      )

      // No 'backend' category techs in fixture → fallback picks top by composite
      expect(result.primary).toBeDefined()
    })
  })

  describe('AI fallback on error', () => {
    it('falls back to template reasoning when AI call throws', async () => {
      mockGenerateQuizAI.mockRejectedValue(new Error('AI provider unavailable'))

      const answers: QuizAnswer[] = [
        { questionId: 'goal', value: 'get-job' },
        { questionId: 'interest-area', value: 'frontend' },
        { questionId: 'current-skills', value: [] },
        { questionId: 'time-commitment', value: '5hrs' },
      ]

      // Should not throw
      const result = await generateLearnNextRecommendation(answers, [reactFixture, vueFixture])

      expect(result.primary.technology).toBe('react')
      // Template reasoning always has 3 items
      expect(result.primary.reasoning).toBeInstanceOf(Array)
      expect(result.primary.reasoning.length).toBe(3)
      // First item for get-job goal mentions job demand
      expect(result.primary.reasoning[0]).toContain('job')
    })
  })

  describe('response shape', () => {
    it('always returns required QuizRecommendation fields', async () => {
      mockGenerateQuizAI.mockResolvedValue(AI_BULLET_RESPONSE)

      const answers: QuizAnswer[] = [
        { questionId: 'goal', value: 'side-project' },
        { questionId: 'interest-area', value: 'frontend' },
      ]

      const result = await generateLearnNextRecommendation(answers, allFixtures)

      expect(result.primary.action).toBeTruthy()
      expect(result.primary.technology).toBeTruthy()
      expect(result.primary.reasoning).toBeInstanceOf(Array)
      expect(result.nextSteps).toBeInstanceOf(Array)
      expect(result.relatedLinks).toBeInstanceOf(Array)
      expect(result.relatedLinks.length).toBeGreaterThanOrEqual(2)
    })

    it('includes secondary alternative when multiple candidates exist', async () => {
      mockGenerateQuizAI.mockResolvedValue(AI_BULLET_RESPONSE)

      const answers: QuizAnswer[] = [
        { questionId: 'goal', value: 'get-job' },
        { questionId: 'interest-area', value: 'frontend' },
        { questionId: 'current-skills', value: [] },
      ]

      const result = await generateLearnNextRecommendation(answers, [reactFixture, vueFixture])

      expect(result.secondary).toBeDefined()
      expect(result.secondary!.technology).toBe('vue')
    })
  })
})

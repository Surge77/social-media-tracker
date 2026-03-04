import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/quiz/ai-helper', () => ({
  generateQuizAI: vi.fn(),
  validateAIResponse: (r: string) => ({ valid: r.length > 10, reason: '' }),
  parseBulletPoints: (r: string) =>
    r.split('\n').filter((l: string) => l.startsWith('- ')).map((l: string) => l.slice(2)),
  getFallback: (_type: string) => 'Fallback reasoning text',
}))

import { calculateStackHealth } from '@/lib/quiz/stack-health-engine'
import { generateQuizAI } from '@/lib/quiz/ai-helper'
import type { QuizAnswer } from '@/lib/quiz/types'
import { reactFixture, vueFixture, angularFixture, jqueryFixture, rustFixture, allFixtures } from './fixtures'

const mockGenerateQuizAI = vi.mocked(generateQuizAI)

beforeEach(() => {
  mockGenerateQuizAI.mockReset()
})

describe('calculateStackHealth', () => {
  describe('empty stack', () => {
    it('returns empty stack recommendation when no techs selected', async () => {
      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: [] },
      ]

      const result = await calculateStackHealth(answers, allFixtures)

      expect(result.primary.action).toBe('No technologies selected')
      expect(result.primary.score).toBe(0)
      expect(mockGenerateQuizAI).not.toHaveBeenCalled()
    })
  })

  describe('strong stack', () => {
    it('reports high health score for a high-scoring stack', async () => {
      // react: composite=80, momentum=4 → strong (score ≥ 60 && momentum > -3)
      // vue: composite=65, momentum=2 → strong (score ≥ 60 && momentum > -3)
      mockGenerateQuizAI.mockResolvedValue(
        'Your React + Vue stack is solid with strong market demand.'
      )

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['react', 'vue'] },
        { questionId: 'experience-years', value: '3-5' },
      ]

      const result = await calculateStackHealth(answers, allFixtures)

      // avgComposite = (80 + 65) / 2 = 72.5
      expect(result.primary.action).toBe('Overall Health: 73/100')
      expect(result.primary.score).toBe(73)

      // AI summary should be in reasoning[0]
      expect(result.primary.reasoning[0]).toContain('solid')

      // Both are strong → no risk warnings
      expect(result.warnings).toBeInstanceOf(Array)
      expect(result.warnings!.length).toBe(0) // no risk techs
    })

    it('mentions strong tech count in reasoning', async () => {
      mockGenerateQuizAI.mockResolvedValue('Strong stack overall.')

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['react', 'vue'] },
      ]

      const result = await calculateStackHealth(answers, allFixtures)

      const strongCount = result.primary.reasoning.find(r => r.includes('strong'))
      expect(strongCount).toBeTruthy()
    })
  })

  describe('risk detection', () => {
    it('flags low-scoring declining tech as risk in warnings', async () => {
      // jqueryFixture: composite=25, momentum=-12
      // categorizeTechHealth: score=25 < 40 → not strong, not watch → risk
      // reason: momentum=-12 < -10 → 'Rapidly declining - plan migration'
      mockGenerateQuizAI.mockResolvedValue('Your stack needs urgent attention.')

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['jquery'] },
      ]

      const result = await calculateStackHealth(answers, [jqueryFixture, ...allFixtures])

      // avgComposite = 25
      expect(result.primary.score).toBe(25)

      // jqueryFixture is at risk → should appear in warnings
      expect(result.warnings).toBeDefined()
      expect(result.warnings!.length).toBeGreaterThan(0)
      expect(result.warnings![0]).toContain('jQuery')
    })

    it('includes migration suggestion for risky tech in nextSteps', async () => {
      mockGenerateQuizAI.mockResolvedValue('Consider modernizing your stack.')

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['jquery'] },
      ]

      const result = await calculateStackHealth(answers, [jqueryFixture, ...allFixtures])

      const hasMigrationStep = result.nextSteps.some(step =>
        step.includes('jQuery') || step.includes('alternatives')
      )
      expect(hasMigrationStep).toBe(true)
    })
  })

  describe('watch category', () => {
    it('categorizes angular (score=70, momentum=-1) as strong not watch', async () => {
      // angular: composite=70 ≥ 60 && momentum=-1 > -3 → strong
      mockGenerateQuizAI.mockResolvedValue('Angular is still solid.')

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['angular'] },
      ]

      const result = await calculateStackHealth(answers, allFixtures)

      // Strong → no warnings for angular
      expect(result.warnings).toBeDefined()
      expect(result.warnings!.length).toBe(0)
    })
  })

  describe('AI fallback on error', () => {
    it('falls back to template summary when AI call throws', async () => {
      mockGenerateQuizAI.mockRejectedValue(new Error('AI provider unavailable'))

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['react', 'vue'] },
      ]

      // Should not throw
      const result = await calculateStackHealth(answers, allFixtures)

      expect(result.primary.action).toBe('Overall Health: 73/100')
      // Template for avgComposite=72.5 (≥70) → "Your stack is in excellent shape..."
      expect(result.primary.reasoning[0]).toContain('excellent')
    })
  })

  describe('skill gaps', () => {
    it('includes skill gap suggestions in nextSteps', async () => {
      mockGenerateQuizAI.mockResolvedValue('Your stack looks good but has some gaps.')

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['react'] },
      ]

      const result = await calculateStackHealth(answers, allFixtures)

      // nextSteps includes skill gap suggestions (from identifySkillGaps)
      const hasGapStep = result.nextSteps.some(step => step.includes('% of relevant jobs'))
      expect(hasGapStep).toBe(true)
    })
  })

  describe('response shape', () => {
    it('always returns required QuizRecommendation fields', async () => {
      mockGenerateQuizAI.mockResolvedValue('Stack analysis complete.')

      const answers: QuizAnswer[] = [
        { questionId: 'daily-stack', value: ['react'] },
      ]

      const result = await calculateStackHealth(answers, allFixtures)

      expect(result.primary.action).toBeTruthy()
      expect(result.primary.reasoning).toBeInstanceOf(Array)
      expect(result.primary.score).toBeGreaterThanOrEqual(0)
      expect(result.warnings).toBeInstanceOf(Array)
      expect(result.nextSteps).toBeInstanceOf(Array)
      expect(result.relatedLinks).toBeInstanceOf(Array)
      expect(result.relatedLinks.length).toBe(4)
    })
  })
})

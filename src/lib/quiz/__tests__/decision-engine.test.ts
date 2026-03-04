import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the AI helper module — generateQuizAI is the only external dependency
vi.mock('@/lib/quiz/ai-helper', () => ({
  generateQuizAI: vi.fn(),
  validateAIResponse: (r: string) => ({ valid: r.length > 10, reason: '' }),
  parseBulletPoints: (r: string) =>
    r.split('\n').filter((l: string) => l.startsWith('- ')).map((l: string) => l.slice(2)),
  getFallback: (_type: string) => 'Fallback reasoning text',
}))

import { generateTechnologyDecision } from '@/lib/quiz/decision-engine'
import { generateQuizAI } from '@/lib/quiz/ai-helper'
import type { QuizAnswer } from '@/lib/quiz/types'
import { allFixtures, reactFixture, vueFixture, angularFixture, rustFixture } from './fixtures'

const mockGenerateQuizAI = vi.mocked(generateQuizAI)

beforeEach(() => {
  mockGenerateQuizAI.mockReset()
})

describe('generateTechnologyDecision', () => {
  describe('web-app use case', () => {
    it('recommends the highest-scoring frontend framework for a web-app', async () => {
      mockGenerateQuizAI.mockResolvedValue(
        'React is the best choice for your solo web application because of its vast ecosystem.'
      )

      const answers: QuizAnswer[] = [
        { questionId: 'use-case', value: 'web-app' },
        { questionId: 'experience-level', value: 'intermediate' },
        { questionId: 'project-constraints', value: 'balanced' },
        { questionId: 'team-size', value: 'solo' },
        { questionId: 'must-haves', value: [] },
      ]

      const result = await generateTechnologyDecision(answers, allFixtures)

      // Should return a valid QuizRecommendation shape
      expect(result.primary.action).toContain('Recommended:')
      expect(result.primary.technology).toBeDefined()
      expect(result.primary.reasoning).toBeInstanceOf(Array)
      expect(result.primary.reasoning.length).toBeGreaterThan(0)
      expect(result.nextSteps).toBeInstanceOf(Array)
      expect(result.relatedLinks).toBeInstanceOf(Array)

      // React has the highest composite + jobs + community score among frontend techs
      expect(result.primary.technology).toBe('react')
      expect(result.primary.action).toBe('Recommended: React')

      // AI-generated text should appear in reasoning
      expect(result.primary.reasoning[0]).toContain('React is the best choice')
    })

    it('secondary recommendation is present when multiple candidates exist', async () => {
      mockGenerateQuizAI.mockResolvedValue('React is ideal for your situation.')

      const answers: QuizAnswer[] = [
        { questionId: 'use-case', value: 'web-app' },
      ]

      const result = await generateTechnologyDecision(answers, allFixtures)

      expect(result.secondary).toBeDefined()
      expect(result.secondary!.action).toMatch(/Alternative:/)
      expect(result.secondary!.reasoning).toBeInstanceOf(Array)
    })
  })

  describe('AI fallback on error', () => {
    it('falls back to template comparison when AI call throws', async () => {
      mockGenerateQuizAI.mockRejectedValue(new Error('AI provider unavailable'))

      const answers: QuizAnswer[] = [
        { questionId: 'use-case', value: 'web-app' },
        { questionId: 'experience-level', value: 'intermediate' },
      ]

      // Should not throw — fallback handles the error
      const result = await generateTechnologyDecision(answers, allFixtures)

      expect(result.primary.technology).toBe('react')
      // Template fallback produces something like "React best balances your requirements."
      expect(result.primary.reasoning[0]).toContain('React')
      expect(result.primary.reasoning.length).toBeGreaterThan(0)
    })
  })

  describe('empty candidates', () => {
    it('returns no-options recommendation when use case has no matching techs', async () => {
      const answers: QuizAnswer[] = [
        { questionId: 'use-case', value: 'mobile-app' },
      ]

      // All fixtures are frontend/language — none are 'mobile' category
      const result = await generateTechnologyDecision(
        answers,
        [reactFixture, vueFixture, angularFixture, rustFixture]
      )

      expect(result.primary.action).toBe('No suitable options found')
      expect(result.primary.technology).toBeUndefined()
      expect(result.nextSteps).toContain('Retake the quiz with different criteria')
      expect(mockGenerateQuizAI).not.toHaveBeenCalled()
    })

    it('returns no-options recommendation for empty tech list', async () => {
      const answers: QuizAnswer[] = [{ questionId: 'use-case', value: 'web-app' }]

      const result = await generateTechnologyDecision(answers, [])

      expect(result.primary.action).toBe('No suitable options found')
    })
  })

  describe('beginner experience level', () => {
    it('boosts community and ecosystem scores for beginners', async () => {
      mockGenerateQuizAI.mockResolvedValue('Great choice for beginners with large community support.')

      const answers: QuizAnswer[] = [
        { questionId: 'use-case', value: 'web-app' },
        { questionId: 'experience-level', value: 'beginner' },
      ]

      const result = await generateTechnologyDecision(answers, allFixtures)

      // React has highest community (90) + ecosystem (88) → wins for beginners
      expect(result.primary.technology).toBe('react')
      expect(result.primary.score).toBeGreaterThan(0)
    })
  })
})

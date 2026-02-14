// Quiz AI Helper - Wrapper for AI calls in quizzes

import { resilientAICall } from '@/lib/ai/resilient-call'
import { createKeyManager } from '@/lib/ai/key-manager'
import type { GenerateOptions } from '@/lib/ai/provider'

const keyManager = createKeyManager()

export type QuizAIType =
  | 'reasoning'
  | 'summary'
  | 'outlook'
  | 'hype-analysis'
  | 'negotiation'
  | 'roadmap-summary'

/**
 * Generate AI response for quiz recommendations
 *
 * Uses existing resilient AI infrastructure with quiz-specific defaults
 */
export async function generateQuizAI(
  type: QuizAIType,
  prompt: string,
  options?: Partial<GenerateOptions>
): Promise<string> {
  const defaults: GenerateOptions = {
    maxTokens: 150,
    temperature: 0.7,
    systemPrompt: 'You are a brutally honest tech career advisor who helps developers make informed decisions based on data, not hype.'
  }

  const finalOptions: GenerateOptions = { ...defaults, ...options }

  try {
    const response = await resilientAICall(
      type,
      async (provider) => {
        return await provider.generateText(prompt, finalOptions)
      },
      keyManager
    )

    return response.trim()
  } catch (error) {
    console.error(`Quiz AI generation failed for ${type}:`, error)
    throw error
  }
}

/**
 * Validate AI response quality
 */
export function validateAIResponse(response: string, minLength = 20): {
  valid: boolean
  fallback?: string
} {
  // Check minimum length
  if (response.length < minLength) {
    return {
      valid: false,
      fallback: 'Based on current market data and trends.'
    }
  }

  // Check for overly confident language (red flags)
  const harmful = [
    'guaranteed',
    'definitely will',
    'never fail',
    'always works',
    '100% certain'
  ]

  const lowerResponse = response.toLowerCase()
  if (harmful.some(word => lowerResponse.includes(word))) {
    return {
      valid: false,
      fallback: 'Based on current trends and market analysis.'
    }
  }

  return { valid: true }
}

/**
 * Parse bullet points from AI response
 */
export function parseBulletPoints(response: string): string[] {
  return response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-') || line.startsWith('•'))
    .map(line => line.replace(/^[-•]\s*/, ''))
    .filter(line => line.length > 0)
}

/**
 * Fallback templates if AI fails
 */
export const FALLBACK_REASONING: Record<QuizAIType, string | string[]> = {
  'reasoning': [
    'Strong job market demand for this technology',
    'Aligns well with your current skills and experience',
    'Realistic learning timeline given your schedule'
  ],
  'summary': 'Your stack shows solid fundamentals with room for strategic growth based on market trends.',
  'outlook': 'Your current skills position you well for the next 2-3 years with strategic additions.',
  'hype-analysis': 'This technology shows strong technical merit but varying levels of employer adoption. Consider your specific career goals.',
  'negotiation': 'Based on market data, your skill combination is in demand across multiple sectors.',
  'roadmap-summary': 'Your learning path is achievable at your current pace with consistent effort.'
}

/**
 * Get fallback for failed AI generation
 */
export function getFallback(type: QuizAIType): string | string[] {
  return FALLBACK_REASONING[type]
}

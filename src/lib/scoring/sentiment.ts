// @ts-ignore - wink-sentiment has no type definitions
import winkSentiment from 'wink-sentiment'

/**
 * Analyze sentiment of a text string.
 *
 * wink-sentiment returns:
 * - score: integer, negative to positive (e.g., -3 to +5)
 * - normalizedScore: float, -1 to +1
 *
 * We normalize to 0-1 scale where 0 = very negative, 0.5 = neutral, 1 = very positive.
 */
export function analyzeSentiment(text: string): number {
  if (!text || text.trim().length === 0) return 0.5 // neutral for empty text
  const result = winkSentiment(text)
  // normalizedScore is -1 to +1, convert to 0 to 1
  return (result.normalizedScore + 1) / 2
}

/**
 * Average sentiment across multiple texts.
 * Used for aggregating sentiment across multiple HN titles, Reddit posts, etc.
 */
export function averageSentiment(texts: string[]): number {
  if (texts.length === 0) return 0.5
  // Filter out any null/undefined values that might have slipped through
  const validTexts = texts.filter((t) => typeof t === 'string' && t.trim().length > 0)
  if (validTexts.length === 0) return 0.5
  const scores = validTexts.map((t) => analyzeSentiment(t))
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}

// Quiz Storage - localStorage helpers for quiz results

import type { QuizResult, QuizType, QuizResultsMap } from './types'

const QUIZ_STORAGE_KEY = 'devtrends_quiz_results'
const CURRENT_VERSION = '1.0.0'

/**
 * Save a quiz result to localStorage
 */
export function saveQuizResult(result: QuizResult): void {
  try {
    const existing = getQuizResults()
    const updated: QuizResultsMap = {
      ...existing,
      [result.quizType]: result
    }
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save quiz result:', error)
  }
}

/**
 * Get all quiz results from localStorage
 */
export function getQuizResults(): QuizResultsMap {
  try {
    const stored = localStorage.getItem(QUIZ_STORAGE_KEY)
    if (!stored) return {}

    const parsed = JSON.parse(stored) as QuizResultsMap

    // Filter out old versions
    const filtered: QuizResultsMap = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (value && value.version === CURRENT_VERSION) {
        filtered[key as QuizType] = value
      }
    }

    return filtered
  } catch (error) {
    console.error('Failed to get quiz results:', error)
    return {}
  }
}

/**
 * Get a specific quiz result
 */
export function getQuizResult(type: QuizType): QuizResult | null {
  const results = getQuizResults()
  return results[type] || null
}

/**
 * Check if user has completed a quiz
 */
export function hasCompletedQuiz(type: QuizType): boolean {
  return getQuizResult(type) !== null
}

/**
 * Clear a specific quiz result
 */
export function clearQuizResult(type: QuizType): void {
  try {
    const results = getQuizResults()
    delete results[type]
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(results))
  } catch (error) {
    console.error('Failed to clear quiz result:', error)
  }
}

/**
 * Clear all quiz results
 */
export function clearAllQuizResults(): void {
  try {
    localStorage.removeItem(QUIZ_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear all quiz results:', error)
  }
}

/**
 * Get completion stats
 */
export function getQuizStats(): {
  totalCompleted: number
  quizzes: Array<{ type: QuizType; completedAt: number }>
} {
  const results = getQuizResults()
  const quizzes = Object.entries(results).map(([type, result]) => ({
    type: type as QuizType,
    completedAt: result!.completedAt
  }))

  return {
    totalCompleted: quizzes.length,
    quizzes: quizzes.sort((a, b) => b.completedAt - a.completedAt)
  }
}

/**
 * Export quiz results as JSON (for debugging or data export)
 */
export function exportQuizResults(): string {
  const results = getQuizResults()
  return JSON.stringify(results, null, 2)
}

/**
 * Get current storage version
 */
export function getStorageVersion(): string {
  return CURRENT_VERSION
}

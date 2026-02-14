'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ComparisonInsight, UserContext } from '@/lib/ai/generators/comparison-insight'

interface AIComparisonState {
  comparison: ComparisonInsight | null
  isLoading: boolean
  error: string | null
  freshness: 'fresh' | null
  cached: boolean
  refetch: () => void
}

export function useAIComparison(
  slugs: string[],
  context?: UserContext
): AIComparisonState {
  const [comparison, setComparison] = useState<ComparisonInsight | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [freshness, setFreshness] = useState<'fresh' | null>(null)
  const [cached, setCached] = useState(false)

  const slugKey = slugs.sort().join(',')
  const contextKey = context ? `${context.role}_${context.goal}` : ''

  const fetchComparison = useCallback(async () => {
    if (slugs.length < 2) {
      setComparison(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let url = `/api/ai/compare?slugs=${slugs.join(',')}`
      if (context) {
        url += `&role=${context.role}&goal=${context.goal}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limited — try again shortly')
        } else if (response.status === 503) {
          setError('AI comparison temporarily unavailable')
        } else {
          setError('Failed to load AI comparison')
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setComparison(data.comparison)
      setFreshness(data.freshness ?? null)
      setCached(data.cached ?? false)
      setIsLoading(false)
    } catch {
      setError('Network error')
      setIsLoading(false)
    }
  }, [slugKey, contextKey])

  useEffect(() => {
    fetchComparison()
  }, [fetchComparison])

  return { comparison, isLoading, error, freshness, cached, refetch: fetchComparison }
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TechInsight } from '@/lib/ai/generators/tech-insight'

interface AIInsightState {
  insight: TechInsight | null
  isLoading: boolean
  error: string | null
  freshness: 'fresh' | 'stale' | 'expired' | null
  cached: boolean
  age: number | null
  refetch: () => void
}

export function useAIInsight(slug: string | null): AIInsightState {
  const [insight, setInsight] = useState<TechInsight | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [freshness, setFreshness] = useState<'fresh' | 'stale' | 'expired' | null>(null)
  const [cached, setCached] = useState(false)
  const [age, setAge] = useState<number | null>(null)

  const fetchInsight = useCallback(async () => {
    if (!slug) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/ai/insights/${slug}`)

      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limited — try again shortly')
        } else if (response.status === 503) {
          setError('AI service temporarily unavailable')
        } else {
          setError('Failed to load AI insight')
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setInsight(data.insight)
      setFreshness(data.freshness ?? null)
      setCached(data.cached ?? false)
      setAge(data.age ?? null)
      setIsLoading(false)
    } catch {
      setError('Network error')
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchInsight()
  }, [fetchInsight])

  return { insight, isLoading, error, freshness, cached, age, refetch: fetchInsight }
}

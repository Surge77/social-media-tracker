'use client'

import { useQuery } from '@tanstack/react-query'
import type { TechnologyCategory } from '@/types'

type TrendLabel = 'Booming' | 'Growing' | 'Stable' | 'Mature' | 'Cooling'

export interface TechStatsResponse {
  market_pulse: {
    hottest: { name: string; slug: string; color: string; score_delta: number } | null
    most_demanded: { name: string; slug: string; color: string; jobs_score: number } | null
    cooling: { name: string; slug: string; color: string; score_delta: number } | null
    hidden_gem: { name: string; slug: string; color: string } | null
    trending: { name: string; slug: string; color: string }[]
    safest_bet: { name: string; slug: string; color: string } | null
  }
  category_health: {
    category: TechnologyCategory
    label: string
    count: number
    avg_score: number
    avg_momentum: number
    trend_label: TrendLabel
    best_tech: { name: string; slug: string; score: number }
  }[]
  score_distribution: {
    bucket: string
    count: number
  }[]
  weekly_digest: {
    highlights: string[]
    period: string
    new_techs_added: number
  }
  popular_stacks: {
    name: string
    description: string
    emoji: string
    technologies: { name: string; slug: string; color: string; score: number }[]
    avg_score: number
  }[]
  last_updated: string | null
}

async function fetchTechStats(): Promise<TechStatsResponse> {
  const response = await fetch('/api/technologies/stats')
  if (!response.ok) throw new Error('Failed to fetch tech stats')
  return response.json()
}

export function useTechStats() {
  const query = useQuery({
    queryKey: ['tech-stats'],
    queryFn: fetchTechStats,
    staleTime: 60 * 60 * 1000,       // 1 hour — matches server s-maxage=3600
    gcTime: 24 * 60 * 60 * 1000,     // Keep in cache for 24h (stale-while-revalidate)
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

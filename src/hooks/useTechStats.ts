'use client'

import { useQuery } from '@tanstack/react-query'
import type { TechStatsResponse } from '@/lib/server/technology-data'
export type { TechStatsResponse } from '@/lib/server/technology-data'

async function fetchTechStats(): Promise<TechStatsResponse> {
  const response = await fetch('/api/technologies/stats')
  if (!response.ok) throw new Error('Failed to fetch tech stats')
  return response.json()
}

export function useTechStats(initialData?: TechStatsResponse | null) {
  const query = useQuery({
    queryKey: ['tech-stats'],
    queryFn: fetchTechStats,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    initialData: initialData ?? undefined,
  })

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

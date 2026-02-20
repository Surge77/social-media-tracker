'use client'

import { useQuery } from '@tanstack/react-query'
import type { TechnologyWithScore, TechnologyCategory } from '@/types'

interface TechnologiesResponse {
  technologies: TechnologyWithScore[]
  last_updated: string | null
}

interface UseTechnologiesOptions {
  category?: TechnologyCategory | 'all'
  sort?: 'score' | 'momentum' | 'name'
  search?: string
  enabled?: boolean
}

async function fetchTechnologies(): Promise<TechnologiesResponse> {
  const response = await fetch('/api/technologies')
  if (!response.ok) throw new Error('Failed to fetch technologies')
  return response.json()
}

export function useTechnologies(options: UseTechnologiesOptions = {}) {
  const { category = 'all', sort = 'score', search = '', enabled = true } = options

  const query = useQuery({
    queryKey: ['technologies'],
    queryFn: fetchTechnologies,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled,
  })

  // Client-side filtering and sorting
  const filtered = query.data?.technologies
    ?.filter((tech) => {
      if (category !== 'all' && tech.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          tech.name.toLowerCase().includes(q) ||
          tech.slug.toLowerCase().includes(q) ||
          tech.aliases?.some((a) => a.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'score') return (b.composite_score ?? 0) - (a.composite_score ?? 0)
      if (sort === 'momentum') return (b.momentum ?? 0) - (a.momentum ?? 0)
      return a.name.localeCompare(b.name)
    })

  return {
    technologies: filtered ?? [],
    lastUpdated: query.data?.last_updated ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

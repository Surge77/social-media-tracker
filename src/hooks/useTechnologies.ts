'use client'

import { useQuery } from '@tanstack/react-query'
import type { TechnologyCategory } from '@/types'
import type { TechnologiesResponse } from '@/lib/server/technology-data'

interface UseTechnologiesOptions {
  category?: TechnologyCategory | 'all'
  sort?: 'score' | 'momentum' | 'name'
  search?: string
  enabled?: boolean
  initialData?: TechnologiesResponse | null
}

async function fetchTechnologies(): Promise<TechnologiesResponse> {
  const response = await fetch('/api/technologies')
  if (!response.ok) throw new Error('Failed to fetch technologies')
  return response.json()
}

export function useTechnologies(options: UseTechnologiesOptions = {}) {
  const {
    category = 'all',
    sort = 'score',
    search = '',
    enabled = true,
    initialData = null,
  } = options

  const query = useQuery({
    queryKey: ['technologies'],
    queryFn: fetchTechnologies,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    enabled,
    initialData: initialData ?? undefined,
  })

  const filtered = query.data?.technologies
    ?.filter((tech) => {
      if (category !== 'all' && tech.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          tech.name.toLowerCase().includes(q) ||
          tech.slug.toLowerCase().includes(q) ||
          tech.aliases?.some((alias) => alias.toLowerCase().includes(q))
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

'use client'

import { useQuery } from '@tanstack/react-query'
import type { TechnologyDetail } from '@/types'

async function fetchTechnology(slug: string): Promise<TechnologyDetail> {
  const response = await fetch(`/api/technologies/${slug}`)
  if (!response.ok) {
    if (response.status === 404) throw new Error('Technology not found')
    throw new Error('Failed to fetch technology')
  }
  return response.json()
}

export function useTechnology(slug: string | undefined) {
  return useQuery({
    queryKey: ['technology', slug],
    queryFn: () => fetchTechnology(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

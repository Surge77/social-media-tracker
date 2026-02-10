'use client'

import { useQuery } from '@tanstack/react-query'
import type { CompareData } from '@/types'

async function fetchCompareData(slugs: string[]): Promise<CompareData> {
  const response = await fetch(`/api/compare?techs=${slugs.join(',')}`)
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to fetch comparison data')
  }
  return response.json()
}

export function useCompare(slugs: string[]) {
  return useQuery({
    queryKey: ['compare', slugs.sort().join(',')],
    queryFn: () => fetchCompareData(slugs),
    enabled: slugs.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

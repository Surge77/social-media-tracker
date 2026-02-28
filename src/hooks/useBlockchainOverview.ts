import { useQuery } from '@tanstack/react-query'

export interface BlockchainOverviewData {
  chains: Array<{
    name: string
    tvl: number
    change_1d: number
    change_7d: number
  }>
  protocols: Array<{
    name: string
    slug: string
    tvl: number
    category: string
    chains: string[]
    change_7d?: number
  }>
  job_counts: Record<string, number>
  fetched_at: string
}

export function useBlockchainOverview() {
  return useQuery<BlockchainOverviewData>({
    queryKey: ['blockchain-overview'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/overview')
      if (!res.ok) throw new Error('Failed to fetch blockchain overview')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

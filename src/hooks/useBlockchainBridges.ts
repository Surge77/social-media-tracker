import { useQuery } from '@tanstack/react-query'
import type { BridgeSummary } from '@/lib/api/defillama-bridges'

export function useBlockchainBridges() {
  return useQuery<BridgeSummary[]>({
    queryKey: ['blockchain-bridges'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/bridges')
      if (!res.ok) throw new Error('Failed to fetch bridge data')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 60,
  })
}

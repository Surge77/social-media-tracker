import { useQuery } from '@tanstack/react-query'
import type { ProtocolFees } from '@/lib/api/defillama-fees'

export function useBlockchainFees() {
  return useQuery<ProtocolFees[]>({
    queryKey: ['blockchain-fees'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/fees')
      if (!res.ok) throw new Error('Failed to fetch protocol fees')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

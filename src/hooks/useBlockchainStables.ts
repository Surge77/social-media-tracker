import { useQuery } from '@tanstack/react-query'
import type { StablecoinChainData } from '@/lib/api/defillama-stables'

export function useBlockchainStables() {
  return useQuery<StablecoinChainData[]>({
    queryKey: ['blockchain-stables'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/stables')
      if (!res.ok) throw new Error('Failed to fetch stablecoin data')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 60,
  })
}

import { useQuery } from '@tanstack/react-query'
import type { HackEvent } from '@/lib/api/defillama-hacks'

export function useBlockchainHacks() {
  return useQuery<HackEvent[]>({
    queryKey: ['blockchain-hacks'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/hacks')
      if (!res.ok) throw new Error('Failed to fetch hacks')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  })
}

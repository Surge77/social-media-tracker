import { useQuery } from '@tanstack/react-query'
import type { GasPrice } from '@/lib/api/gas-tracker'

export function useGasTracker() {
  return useQuery<GasPrice[]>({
    queryKey: ['gas-tracker'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/gas')
      if (!res.ok) throw new Error('Failed to fetch gas prices')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 5,      // 5 minutes
    refetchInterval: 1000 * 60 * 5, // auto-refresh every 5 min
  })
}

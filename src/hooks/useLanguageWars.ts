import { useQuery } from '@tanstack/react-query'
import type { LanguageSignal, FrameworkSignal } from '@/lib/api/sc-languages'
import type { NpmDownloadSummary } from '@/lib/api/npm-downloads'

interface LanguageWarsData {
  languages: LanguageSignal[]
  frameworks: FrameworkSignal[]
  walletLibs: NpmDownloadSummary[]
}

export function useLanguageWars() {
  return useQuery<LanguageWarsData>({
    queryKey: ['language-wars'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/sc-languages')
      if (!res.ok) throw new Error('Failed to fetch language wars data')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

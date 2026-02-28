/**
 * DeFiLlama Hacks API
 * Returns all recorded DeFi exploits. No key required.
 */

const BASE = 'https://api.llama.fi'

export interface HackEvent {
  id: string
  name: string
  date: string          // ISO date string
  amount: number        // USD stolen
  chains: string[]
  category: string      // 'Hack' | 'Rug Pull' | 'Phishing' etc.
  technique: string     // 'Private Key Compromise' | 'Reentrancy' | 'Flash Loan' etc.
  defillamaId?: string
}

interface RawHack {
  id?: string
  name: string
  date: number          // unix timestamp (seconds)
  amount?: number
  chains?: string[]
  category?: string
  technique?: string
  defillamaId?: string
}

export async function fetchRecentHacks(limit = 20): Promise<HackEvent[]> {
  const res = await fetch(`${BASE}/hacks`, { next: { revalidate: 21600 } }) // 6h cache
  if (!res.ok) throw new Error(`DeFiLlama /hacks failed: ${res.status}`)

  const data: RawHack[] = await res.json()

  return data
    .filter((h) => h.amount && h.amount > 100_000) // filter dust events
    .sort((a, b) => b.date - a.date)
    .slice(0, limit)
    .map((h) => ({
      id: h.id ?? `${h.name}-${h.date}`,
      name: h.name,
      date: new Date(h.date * 1000).toISOString(),
      amount: h.amount ?? 0,
      chains: h.chains ?? [],
      category: h.category ?? 'Hack',
      technique: h.technique ?? 'Unknown',
      defillamaId: h.defillamaId,
    }))
}

export function fmtHackAmount(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

/**
 * DeFiLlama Bridges API
 * No key required. https://bridges.llama.fi
 */

const BASE = 'https://bridges.llama.fi'

export interface BridgeSummary {
  id: number
  name: string
  icon?: string
  volume24h: number
  volume7d: number
  chains: string[]
  destinationChain?: string
}

interface RawBridge {
  id: number
  name: string
  icon?: string
  chains?: string[]
  destinationChain?: string
  currentDayVolume?: number
  weeklyVolume?: number
}

export async function fetchTopBridges(limit = 10): Promise<BridgeSummary[]> {
  const res = await fetch(`${BASE}/bridges?includeChains=true`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`DeFiLlama /bridges failed: ${res.status}`)

  const data = await res.json()
  const bridges: RawBridge[] = data.bridges ?? []

  return bridges
    .filter((b) => (b.currentDayVolume ?? 0) > 0)
    .sort((a, b) => (b.currentDayVolume ?? 0) - (a.currentDayVolume ?? 0))
    .slice(0, limit)
    .map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      volume24h: b.currentDayVolume ?? 0,
      volume7d: b.weeklyVolume ?? 0,
      chains: b.chains ?? [],
      destinationChain: b.destinationChain,
    }))
}

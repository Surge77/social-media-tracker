/**
 * DeFiLlama API client — no key required.
 * Rate: no documented limit, be polite (max 20 req/s).
 * Docs: https://defillama.com/docs/api
 */

const BASE = 'https://api.llama.fi'

export interface ChainTVL {
  name: string          // 'Ethereum' | 'Solana' | etc.
  tvl: number           // USD
  change_1d: number     // %
  change_7d: number     // %
}

export interface Protocol {
  name: string
  slug: string
  tvl: number
  change_1d: number | null
  change_7d: number | null
  category: string      // 'Dexes' | 'Lending' | 'Bridge' | etc.
  chains: string[]
  github?: string[]
  url: string
}

export interface ChainHistory {
  date: number          // unix timestamp
  tvl: number
}

/** Top chains by TVL */
export async function fetchChainTVLs(): Promise<ChainTVL[]> {
  const res = await fetch(`${BASE}/v2/chains`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`DeFiLlama /v2/chains failed: ${res.status}`)
  const data = await res.json()
  return (data as ChainTVL[])
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 20)
}

/** All protocols, filtered to top 100 by TVL */
export async function fetchTopProtocols(): Promise<Protocol[]> {
  const res = await fetch(`${BASE}/protocols`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`DeFiLlama /protocols failed: ${res.status}`)
  const data = await res.json()
  return (data as Protocol[])
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 100)
}

/** Historical TVL for a single chain (e.g. 'ethereum') */
export async function fetchChainHistory(chain: string): Promise<ChainHistory[]> {
  const res = await fetch(`${BASE}/v2/historicalChainTvl/${chain}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`DeFiLlama chain history failed: ${res.status}`)
  return res.json()
}

/** TVL for a specific protocol by slug */
export async function fetchProtocolTVL(slug: string): Promise<{
  tvl: number
  change_1d: number | null
  change_7d: number | null
}> {
  const protocols = await fetchTopProtocols()
  const p = protocols.find((x) => x.slug === slug || x.name.toLowerCase() === slug.toLowerCase())
  if (!p) return { tvl: 0, change_1d: null, change_7d: null }
  return { tvl: p.tvl, change_1d: p.change_1d, change_7d: p.change_7d }
}

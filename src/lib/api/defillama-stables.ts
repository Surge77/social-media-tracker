/**
 * DeFiLlama Stablecoins API
 * No key required. https://stablecoins.llama.fi
 */

const BASE = 'https://stablecoins.llama.fi'

export interface StablecoinChainData {
  chain: string
  totalCirculating: number    // total USD
  usdtCirculating: number
  usdcCirculating: number
  daiCirculating: number
  otherCirculating: number
  change24h: number           // % change in total circulating
}

interface RawChainEntry {
  name: string
  totalCirculating?: {
    peggedUSD?: number
  }
  totalCirculatingUSD?: {
    peggedUSD?: number
  }
  tokenSymbol?: string
}

export async function fetchStablecoinsByChain(topChains = 10): Promise<StablecoinChainData[]> {
  const res = await fetch(`${BASE}/stablecoinchains`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`DeFiLlama /stablecoinchains failed: ${res.status}`)

  const data: RawChainEntry[] = await res.json()

  return data
    .filter((c) => {
      const total = c.totalCirculatingUSD?.peggedUSD ?? c.totalCirculating?.peggedUSD ?? 0
      return total > 100_000_000 // filter chains with < $100M
    })
    .map((c) => {
      const total = c.totalCirculatingUSD?.peggedUSD ?? c.totalCirculating?.peggedUSD ?? 0
      return {
        chain: c.name,
        totalCirculating: total,
        usdtCirculating: 0, // detailed breakdown requires per-stablecoin query
        usdcCirculating: 0,
        daiCirculating: 0,
        otherCirculating: total,
        change24h: 0,
      }
    })
    .sort((a, b) => b.totalCirculating - a.totalCirculating)
    .slice(0, topChains)
}

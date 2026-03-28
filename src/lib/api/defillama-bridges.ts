import { buildBridgeLeaders } from '@/lib/blockchain/bridge-leaders'

/**
 * Bridge leaderboard derived from DeFiLlama's free /protocols feed.
 *
 * The dedicated bridge volume endpoints are now pro-only, so the blockchain
 * page uses the closest public bridge metric still available: TVL and 7d trend.
 */

export interface BridgeSummary {
  name: string
  slug: string
  logo?: string | null
  tvl: number
  change_7d: number
  chains: string[]
}

interface RawBridge {
  name: string
  slug: string
  tvl: number
  category: string
  chains?: string[]
  change_7d?: number | null
  logo?: string | null
}

export async function fetchTopBridges(limit = 10): Promise<BridgeSummary[]> {
  const res = await fetch('https://api.llama.fi/protocols', {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`DeFiLlama /protocols failed: ${res.status}`)

  const data = await res.json()
  return buildBridgeLeaders(
    (data as RawBridge[])
      .filter((protocol) => protocol.tvl > 0)
      .map((protocol) => ({
        ...protocol,
        chains: protocol.chains ?? [],
      })),
    limit
  )
}

type BridgeLeaderInput = {
  name: string
  slug: string
  tvl: number
  category: string
  chains: string[]
  change_7d?: number | null
  logo?: string | null
}

export function buildBridgeLeaders(protocols: BridgeLeaderInput[], limit = 10) {
  return protocols
    .filter((protocol) => protocol.category === 'Bridge')
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, limit)
    .map((protocol) => ({
      name: protocol.name,
      slug: protocol.slug,
      tvl: protocol.tvl,
      chains: protocol.chains,
      change_7d: protocol.change_7d ?? 0,
      logo: protocol.logo ?? null,
    }))
}

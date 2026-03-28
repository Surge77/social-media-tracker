type OverviewChain = {
  name: string
  tvl: number
  change_1d: number
  change_7d: number
}

type OverviewProtocolInput = {
  name: string
  slug: string
  tvl: number
  category: string
  chains: string[]
  change_7d?: number | null
  logo?: string | null
}

type BlockchainOverviewCache = {
  fetched_at?: string
  chains?: OverviewChain[]
  protocols?: OverviewProtocolInput[]
}

export function toOverviewProtocol(protocol: OverviewProtocolInput) {
  return {
    name: protocol.name,
    slug: protocol.slug,
    tvl: protocol.tvl,
    category: protocol.category,
    chains: protocol.chains,
    change_7d: protocol.change_7d ?? 0,
    logo: protocol.logo ?? null,
  }
}

export function hasFreshBlockchainOverviewCache(data: BlockchainOverviewCache): boolean {
  if (!data.fetched_at) return false

  const age = Date.now() - new Date(data.fetched_at).getTime()
  const hasChangeFields = data.chains?.[0]?.change_1d !== undefined
  const hasProtocolLogos = data.protocols?.some((protocol) => Boolean(protocol.logo)) ?? false

  return age < 86400000 && hasChangeFields && hasProtocolLogos
}

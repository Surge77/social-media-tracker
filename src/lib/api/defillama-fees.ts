/**
 * DeFiLlama Fees & Revenue API
 * Docs: https://defillama.com/docs/api  (no key required)
 */

const BASE = 'https://api.llama.fi'

export interface ProtocolFees {
  name: string
  slug: string
  category: string
  logo?: string
  dailyFees: number | null
  weeklyFees: number | null
  monthlyFees: number | null
  dailyRevenue: number | null
  weeklyRevenue: number | null
  chains: string[]
}

interface RawProtocol {
  name: string
  module: string
  category: string
  logo?: string
  total24h?: number
  total7d?: number
  total30d?: number
  totalAllTime?: number
  chains?: string[]
}

interface RawRevenueProtocol extends RawProtocol {
  revenue24h?: number
  revenue7d?: number
}

export async function fetchProtocolFees(limit = 20): Promise<ProtocolFees[]> {
  const [feesRes, revenueRes] = await Promise.all([
    fetch(`${BASE}/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${BASE}/overview/revenue?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`, {
      next: { revalidate: 3600 },
    }),
  ])

  if (!feesRes.ok) throw new Error(`DeFiLlama fees failed: ${feesRes.status}`)

  const feesData = await feesRes.json()
  const revenueData = revenueRes.ok ? await revenueRes.json() : { protocols: [] }

  const revenueMap = new Map<string, RawRevenueProtocol>()
  for (const p of (revenueData.protocols ?? []) as RawRevenueProtocol[]) {
    revenueMap.set(p.name, p)
  }

  const protocols = (feesData.protocols ?? []) as RawProtocol[]

  return protocols
    .filter((p) => p.total24h != null && p.total24h > 0)
    .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
    .slice(0, limit)
    .map((p) => {
      const rev = revenueMap.get(p.name)
      return {
        name: p.name,
        slug: p.module,
        category: p.category,
        logo: p.logo,
        dailyFees: p.total24h ?? null,
        weeklyFees: p.total7d ?? null,
        monthlyFees: p.total30d ?? null,
        dailyRevenue: rev?.revenue24h ?? null,
        weeklyRevenue: rev?.revenue7d ?? null,
        chains: p.chains ?? [],
      }
    })
}

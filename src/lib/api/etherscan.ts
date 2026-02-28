/**
 * Etherscan API client.
 * Rate: 5 req/sec on free tier — enforced by delay() between calls.
 * Same key works for BSCScan, PolygonScan, Arbiscan (different BASE_URL).
 */

const ETHERSCAN_BASE = 'https://api.etherscan.io/api'
const KEY = process.env.ETHERSCAN_API_KEY ?? ''

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function etherscanFetch<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, apikey: KEY }).toString()
  const res = await fetch(`${ETHERSCAN_BASE}?${qs}`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`Etherscan fetch failed: ${res.status}`)
  const json = await res.json()
  if (json.status === '0') throw new Error(`Etherscan error: ${json.result}`)
  return json.result as T
}

export interface UniqueAddressCount {
  UTCDate: string          // "2026-01-15"
  uniqueAddresses: string  // stringified number
}

/** Monthly unique addresses (deployer proxy) */
export async function fetchUniqueAddresses(days = 30): Promise<UniqueAddressCount[]> {
  await delay(250)
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  return etherscanFetch<UniqueAddressCount[]>({
    module: 'stats',
    action: 'dailyuniqueaddresses',
    startdate: startDate,
    enddate: endDate,
    sort: 'asc',
  })
}

/**
 * Daily transaction count — proxy for overall network activity.
 * Higher activity → more developers building.
 */
export async function fetchDailyTxCount(days = 7): Promise<{ UTCDate: string; transactionCount: string }[]> {
  await delay(250)
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  return etherscanFetch<{ UTCDate: string; transactionCount: string }[]>({
    module: 'stats',
    action: 'dailytx',
    startdate: startDate,
    enddate: endDate,
    sort: 'desc',
  })
}

/**
 * Compute an "on-chain activity score" (0-100) for Ethereum ecosystem techs.
 * Based on: daily tx count trend (7d vs 30d average)
 */
export async function computeEthereumActivityScore(): Promise<number> {
  try {
    const txData = await fetchDailyTxCount(30)
    if (txData.length < 7) return 50

    const recent7 = txData.slice(0, 7).reduce((s, d) => s + Number(d.transactionCount), 0) / 7
    const older30 = txData.reduce((s, d) => s + Number(d.transactionCount), 0) / txData.length

    // Ratio of recent vs baseline — normalize to 0-100
    const ratio = recent7 / Math.max(older30, 1)
    return Math.min(100, Math.max(0, Math.round((ratio - 0.9) * 500)))
  } catch {
    return 50 // fallback neutral score
  }
}

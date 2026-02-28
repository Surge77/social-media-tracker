/**
 * CoinGecko API client — Demo key, 30 req/min.
 * developer_data=true gives: commit_count_4_weeks, code_additions_deletions_4_weeks,
 * pull_request_contributors, pull_requests_merged, closed_issues
 */

const BASE = 'https://api.coingecko.com/api/v3'
const KEY  = process.env.COINGECKO_API_KEY ?? ''

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Map our tech slugs to CoinGecko coin IDs
export const COINGECKO_ID_MAP: Record<string, string> = {
  'solidity':          'ethereum',
  'vyper':             'ethereum',
  'hardhat':           'ethereum',
  'foundry':           'ethereum',
  'openzeppelin':      'ethereum',
  'wagmi':             'ethereum',
  'uniswap':           'uniswap',
  'aave':              'aave',
  'chainlink':         'chainlink',
  'the-graph':         'the-graph',
  'ipfs':              'filecoin',       // Protocol Labs family
  'anchor-framework':  'solana',
  'move-lang':         'aptos',
  'cairo-lang':        'starknet',
  'ink-lang':          'polkadot',
  'clarity':           'blockstack',
  'tact':              'the-open-network',
}

export interface CoinGeckoDeveloperData {
  forks: number
  stars: number
  subscribers: number
  total_issues: number
  closed_issues: number
  pull_requests_merged: number
  pull_request_contributors: number
  code_additions_deletions_4_weeks: {
    additions: number
    deletions: number
  }
  commit_count_4_weeks: number
}

export async function fetchDeveloperData(
  coinId: string
): Promise<CoinGeckoDeveloperData | null> {
  await delay(2100) // 30 req/min = 1 req/2s, add buffer

  try {
    const res = await fetch(
      `${BASE}/coins/${coinId}?developer_data=true&community_data=false&market_data=false&sparkline=false`,
      {
        headers: KEY ? { 'x-cg-demo-api-key': KEY } : {},
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.developer_data as CoinGeckoDeveloperData
  } catch {
    return null
  }
}

/**
 * Compute a developer activity score (0-100) from CoinGecko dev data.
 * Uses: commit velocity + PR merges + contributor count
 */
export function computeCoinGeckoDevScore(data: CoinGeckoDeveloperData): number {
  const commitScore = Math.min(100, (data.commit_count_4_weeks / 200) * 100)
  const prScore     = Math.min(100, (data.pull_requests_merged / 50) * 100)
  const contriScore = Math.min(100, (data.pull_request_contributors / 30) * 100)
  const additions   = data.code_additions_deletions_4_weeks?.additions ?? 0
  const codeScore   = Math.min(100, (additions / 10000) * 100)

  return Math.round(commitScore * 0.35 + prScore * 0.25 + contriScore * 0.25 + codeScore * 0.15)
}

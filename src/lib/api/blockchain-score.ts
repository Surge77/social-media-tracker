import { fetchTopProtocols } from './defillama'
import { fetchDeveloperData, computeCoinGeckoDevScore, COINGECKO_ID_MAP } from './coingecko'
import { computeEthereumActivityScore } from './etherscan'

export interface OnchainScoreResult {
  onchain_score: number        // 0-100
  tvl_score: number            // 0-100 (TVL rank among all protocols)
  dev_activity_score: number   // 0-100 (CoinGecko dev data)
  chain_activity_score: number // 0-100 (Etherscan network activity)
}

// Map tech slugs to their DeFiLlama protocol slugs for TVL lookup
const DEFILLAMA_SLUG_MAP: Record<string, string> = {
  'uniswap':      'uniswap',
  'aave':         'aave-v3',
  'chainlink':    'chainlink',
  'the-graph':    'the-graph',
  'ipfs':         'filecoin',
  'openzeppelin': '',  // No direct TVL — skip
}

export async function computeOnchainScore(techSlug: string): Promise<OnchainScoreResult> {
  const [protocols, chainActivityScore] = await Promise.all([
    fetchTopProtocols().catch(() => []),
    computeEthereumActivityScore().catch(() => 50),
  ])

  // TVL score: rank the protocol among top 100, normalize to 0-100
  const llamaSlug = DEFILLAMA_SLUG_MAP[techSlug]
  let tvlScore = 0
  if (llamaSlug) {
    const idx = protocols.findIndex(
      (p) => p.slug === llamaSlug || p.name.toLowerCase() === llamaSlug
    )
    if (idx >= 0) {
      tvlScore = Math.round(((100 - idx) / 100) * 100)
    }
  }

  // Developer activity score from CoinGecko
  const cgId = COINGECKO_ID_MAP[techSlug]
  let devActivityScore = 50
  if (cgId) {
    const devData = await fetchDeveloperData(cgId)
    if (devData) devActivityScore = computeCoinGeckoDevScore(devData)
  }

  // Composite onchain score
  const hasProtocol = llamaSlug !== undefined && llamaSlug !== ''
  const onchain_score = hasProtocol
    ? Math.round(tvlScore * 0.40 + devActivityScore * 0.40 + chainActivityScore * 0.20)
    : Math.round(devActivityScore * 0.70 + chainActivityScore * 0.30)

  return {
    onchain_score,
    tvl_score: tvlScore,
    dev_activity_score: devActivityScore,
    chain_activity_score: chainActivityScore,
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub all three sub-modules before importing the orchestrator
vi.mock('@/lib/api/defillama', () => ({
  fetchTopProtocols:  vi.fn(),
  fetchProtocolTVL:   vi.fn(),
}))
vi.mock('@/lib/api/coingecko', () => ({
  COINGECKO_ID_MAP:         { solidity: 'ethereum', 'anchor-framework': 'solana' },
  fetchDeveloperData:       vi.fn(),
  computeCoinGeckoDevScore: vi.fn(),
}))
vi.mock('@/lib/api/etherscan', () => ({
  computeEthereumActivityScore: vi.fn(),
}))

import { computeOnchainScore } from '@/lib/api/blockchain-score'
import { fetchTopProtocols }   from '@/lib/api/defillama'
import {
  fetchDeveloperData,
  computeCoinGeckoDevScore,
} from '@/lib/api/coingecko'
import { computeEthereumActivityScore } from '@/lib/api/etherscan'

const mockFetchTopProtocols = vi.mocked(fetchTopProtocols)
const mockFetchDeveloperData = vi.mocked(fetchDeveloperData)
const mockCGDevScore         = vi.mocked(computeCoinGeckoDevScore)
const mockEthActivity        = vi.mocked(computeEthereumActivityScore)

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchTopProtocols.mockResolvedValue([])
  mockFetchDeveloperData.mockResolvedValue(null)
  mockCGDevScore.mockReturnValue(0)
  mockEthActivity.mockResolvedValue(0)
})

describe('computeOnchainScore', () => {
  it('returns a baseline score for an unknown slug (devActivityScore defaults to 50)', async () => {
    // 'unknown-lang' has no DeFiLlama or CoinGecko mapping.
    // tvlScore=0, chainActivity=0, devActivityScore defaults to 50 (no cgId)
    // formula: round(50 * 0.70 + 0 * 0.30) = 35
    const result = await computeOnchainScore('unknown-lang')
    expect(result.tvl_score).toBe(0)
    expect(result.chain_activity_score).toBe(0)
    expect(result.dev_activity_score).toBe(50)   // default fallback
    expect(result.onchain_score).toBe(35)
  })

  it('produces a positive score when TVL and activity are high', async () => {
    // Provide a protocol matching 'solidity' → 'ethereum'
    mockFetchTopProtocols.mockResolvedValue([
      { name: 'Ethereum', slug: 'ethereum', tvl: 100e9, change_1d: 0, change_7d: 0, category: 'Chain', chains: ['Ethereum'], url: '' },
    ] as any)
    mockEthActivity.mockResolvedValue(80)
    mockFetchDeveloperData.mockResolvedValue({ forks: 1000, stars: 5000 } as any)
    mockCGDevScore.mockReturnValue(70)

    const result = await computeOnchainScore('solidity')

    expect(result.onchain_score).toBeGreaterThan(0)
    expect(result.onchain_score).toBeLessThanOrEqual(100)
    expect(result.chain_activity_score).toBe(80)
  })

  it('caps the score at 100', async () => {
    mockFetchTopProtocols.mockResolvedValue([
      { name: 'Ethereum', slug: 'ethereum', tvl: 1e15, change_1d: 0, change_7d: 0, category: 'Chain', chains: ['Ethereum'], url: '' },
    ] as any)
    mockEthActivity.mockResolvedValue(100)
    mockCGDevScore.mockReturnValue(100)
    mockFetchDeveloperData.mockResolvedValue({} as any)

    const result = await computeOnchainScore('solidity')
    expect(result.onchain_score).toBeLessThanOrEqual(100)
  })

  it('handles fetchTopProtocols and etherscan errors gracefully (both have .catch())', async () => {
    // Only these two are caught with .catch() in the implementation
    mockFetchTopProtocols.mockRejectedValue(new Error('network'))
    mockEthActivity.mockRejectedValue(new Error('rate limit'))
    // fetchDeveloperData is fine (returns null → devActivityScore = 0 for known cgId)
    mockFetchDeveloperData.mockResolvedValue(null)
    mockCGDevScore.mockReturnValue(0)

    // Should not throw — fetchTopProtocols → [] (catch), etherscan → 50 (catch)
    const result = await computeOnchainScore('solidity')

    // solidity → cgId='ethereum' → devData=null → devActivityScore=0
    // chainActivity=50 (fallback), tvlScore=0 (protocols=[])
    // hasProtocol = false (solidity not in DEFILLAMA_SLUG_MAP)
    // score = round(0 * 0.70 + 50 * 0.30) = 15
    expect(result.onchain_score).toBeGreaterThanOrEqual(0)
    expect(result.onchain_score).toBeLessThanOrEqual(100)
  })
})

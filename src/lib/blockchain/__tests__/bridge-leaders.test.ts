import { describe, expect, it } from 'vitest'

import { buildBridgeLeaders } from '@/lib/blockchain/bridge-leaders'

describe('buildBridgeLeaders', () => {
  it('keeps only bridge protocols, sorted by tvl, with normalized fields', () => {
    const leaders = buildBridgeLeaders([
      {
        name: 'Aave V3',
        slug: 'aave-v3',
        tvl: 10_000,
        category: 'Lending',
        chains: ['Ethereum'],
        change_7d: 4.5,
        logo: 'https://icons.llama.fi/aave-v3.png',
      },
      {
        name: 'Across',
        slug: 'across',
        tvl: 50_000,
        category: 'Bridge',
        chains: ['Ethereum', 'Base'],
        change_7d: 8.2,
        logo: 'https://icons.llama.fi/across.png',
      },
      {
        name: 'Stargate',
        slug: 'stargate',
        tvl: 30_000,
        category: 'Bridge',
        chains: ['Ethereum', 'Arbitrum'],
        change_7d: null,
        logo: null,
      },
    ])

    expect(leaders).toEqual([
      {
        name: 'Across',
        slug: 'across',
        tvl: 50_000,
        chains: ['Ethereum', 'Base'],
        change_7d: 8.2,
        logo: 'https://icons.llama.fi/across.png',
      },
      {
        name: 'Stargate',
        slug: 'stargate',
        tvl: 30_000,
        chains: ['Ethereum', 'Arbitrum'],
        change_7d: 0,
        logo: null,
      },
    ])
  })

  it('limits the result size', () => {
    const leaders = buildBridgeLeaders(
      Array.from({ length: 12 }, (_, i) => ({
        name: `Bridge ${i}`,
        slug: `bridge-${i}`,
        tvl: 100 - i,
        category: 'Bridge',
        chains: ['Ethereum'],
        change_7d: i,
        logo: null,
      })),
      5
    )

    expect(leaders).toHaveLength(5)
    expect(leaders[0]?.slug).toBe('bridge-0')
    expect(leaders[4]?.slug).toBe('bridge-4')
  })
})

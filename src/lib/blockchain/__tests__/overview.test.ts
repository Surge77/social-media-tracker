import { describe, expect, it } from 'vitest'

import { hasFreshBlockchainOverviewCache, toOverviewProtocol } from '@/lib/blockchain/overview'

describe('toOverviewProtocol', () => {
  it('preserves the upstream logo url for protocol rows', () => {
    expect(
      toOverviewProtocol({
        name: 'Aave V3',
        slug: 'aave-v3',
        tvl: 123,
        category: 'Lending',
        chains: ['Ethereum'],
        change_7d: 4.2,
        logo: 'https://icons.llama.fi/aave-v3.png',
      })
    ).toMatchObject({
      slug: 'aave-v3',
      logo: 'https://icons.llama.fi/aave-v3.png',
    })
  })
})

describe('hasFreshBlockchainOverviewCache', () => {
  it('treats cached overview data without protocol logos as stale', () => {
    expect(
      hasFreshBlockchainOverviewCache({
        fetched_at: new Date().toISOString(),
        chains: [{ name: 'Ethereum', tvl: 1, change_1d: 1, change_7d: 1 }],
        protocols: [{ name: 'Lido', slug: 'lido', tvl: 1, category: 'Liquid Staking', chains: ['Ethereum'] }],
      })
    ).toBe(false)
  })

  it('accepts recent cached overview data when protocol logos are present', () => {
    expect(
      hasFreshBlockchainOverviewCache({
        fetched_at: new Date().toISOString(),
        chains: [{ name: 'Ethereum', tvl: 1, change_1d: 1, change_7d: 1 }],
        protocols: [
          {
            name: 'Lido',
            slug: 'lido',
            tvl: 1,
            category: 'Liquid Staking',
            chains: ['Ethereum'],
            logo: 'https://icons.llama.fi/lido.png',
          },
        ],
      })
    ).toBe(true)
  })
})

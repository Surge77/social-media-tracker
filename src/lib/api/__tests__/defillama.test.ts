import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global fetch so tests never hit the network
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import {
  fetchChainTVLs,
  fetchTopProtocols,
  fetchProtocolTVL,
} from '@/lib/api/defillama'

beforeEach(() => {
  mockFetch.mockReset()
})

// ─── fetchChainTVLs ───────────────────────────────────────────────────────────

describe('fetchChainTVLs', () => {
  it('returns chains sorted by TVL (descending)', async () => {
    const payload = [
      { name: 'Solana',   tvl: 8e9,  change_1d: 1.2, change_7d: 5.0 },
      { name: 'Ethereum', tvl: 50e9, change_1d: 0.5, change_7d: 2.1 },
    ]
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => payload })

    const chains = await fetchChainTVLs()

    expect(chains[0].name).toBe('Ethereum')  // highest TVL first
    expect(chains[1].name).toBe('Solana')
  })

  it('limits to 20 chains', async () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      name: `Chain-${i}`, tvl: (30 - i) * 1e9, change_1d: 0, change_7d: 0,
    }))
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => many })

    const chains = await fetchChainTVLs()
    expect(chains.length).toBe(20)
  })

  it('throws when the API returns an error status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    await expect(fetchChainTVLs()).rejects.toThrow('DeFiLlama /v2/chains failed: 503')
  })

  it('propagates network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'))
    await expect(fetchChainTVLs()).rejects.toThrow('network')
  })
})

// ─── fetchTopProtocols ────────────────────────────────────────────────────────

describe('fetchTopProtocols', () => {
  it('returns protocols sorted by TVL, up to 100', async () => {
    const many = Array.from({ length: 120 }, (_, i) => ({
      name: `Protocol-${i}`,
      slug: `protocol-${i}`,
      tvl: (120 - i) * 1e6,
      category: 'Dexes',
      chains: ['Ethereum'],
      change_1d: null,
      change_7d: 0,
      url: '',
    }))
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => many })

    const protocols = await fetchTopProtocols()

    expect(protocols.length).toBe(100)
    expect(protocols[0].name).toBe('Protocol-0')  // highest TVL first
  })

  it('throws when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    await expect(fetchTopProtocols()).rejects.toThrow('DeFiLlama /protocols failed: 500')
  })
})

// ─── fetchProtocolTVL ─────────────────────────────────────────────────────────

describe('fetchProtocolTVL', () => {
  it('returns tvl and 7d change when protocol found by slug', async () => {
    // fetchProtocolTVL internally calls fetchTopProtocols → fetch('/protocols')
    const protocols = [
      { name: 'Uniswap', slug: 'uniswap', tvl: 3e9, change_1d: 1.0, change_7d: 4.5, category: 'Dexes', chains: ['Ethereum'], url: '' },
    ]
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => protocols })

    const result = await fetchProtocolTVL('uniswap')

    expect(result.tvl).toBe(3e9)
    expect(result.change_7d).toBe(4.5)
  })

  it('returns zero tvl when slug not found', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] })
    const result = await fetchProtocolTVL('nonexistent-protocol')
    expect(result.tvl).toBe(0)
  })

  it('propagates errors from fetchTopProtocols', async () => {
    mockFetch.mockRejectedValueOnce(new Error('timeout'))
    await expect(fetchProtocolTVL('uniswap')).rejects.toThrow('timeout')
  })
})

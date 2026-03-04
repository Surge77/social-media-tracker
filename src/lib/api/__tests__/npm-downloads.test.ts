import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => { vi.stubGlobal('fetch', mockFetch) })
afterEach(() => { vi.unstubAllGlobals() })

// ─── Import ──────────────────────────────────────────────────────────────────

import { fetchWalletLibraryDownloads, WALLET_LIBRARIES } from '@/lib/api/npm-downloads'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('fetchWalletLibraryDownloads()', () => {
  it('returns download summary for each WALLET_LIBRARIES entry', async () => {
    // Each library makes 3 fetches: weekly, monthly, range
    const perLibraryCalls = 3
    const totalCalls = WALLET_LIBRARIES.length * perLibraryCalls

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('last-week')) {
        return Promise.resolve({ ok: true, json: async () => ({ downloads: 500000 }) })
      }
      if (url.includes('last-month')) {
        return Promise.resolve({ ok: true, json: async () => ({ downloads: 2000000 }) })
      }
      // range
      return Promise.resolve({
        ok: true,
        json: async () => ({
          downloads: Array.from({ length: 84 }, (_, i) => ({
            day: `2026-01-${(i % 30) + 1}`.padStart(10, '0'),
            downloads: 70000,
          })),
        }),
      })
    })

    const results = await fetchWalletLibraryDownloads()

    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(WALLET_LIBRARIES.length)

    const first = results[0]
    expect(first.package).toBeTruthy()
    expect(first.label).toBeTruthy()
    expect(first.weeklyDownloads).toBe(500000)
    expect(first.monthlyDownloads).toBe(2000000)
    expect(Array.isArray(first.trend)).toBe(true)
  })

  it('returns 0 for weekly downloads when fetch fails (ok: false)', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('last-week')) {
        return Promise.resolve({ ok: false, status: 404 })
      }
      if (url.includes('last-month')) {
        return Promise.resolve({ ok: false })
      }
      return Promise.resolve({ ok: false })
    })

    const results = await fetchWalletLibraryDownloads()
    results.forEach((r) => {
      expect(r.weeklyDownloads).toBe(0)
      expect(r.monthlyDownloads).toBe(0)
    })
  })

  it('handles scoped packages (@org/pkg) with correct URL encoding', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ ok: true, json: async () => ({ downloads: 100 }) })
    )

    await fetchWalletLibraryDownloads()

    // Check that scoped packages like @solana/web3.js are URL-encoded in requests
    const urls = mockFetch.mock.calls.map((args) => args[0] as string)
    const scopedCalls = urls.filter((u) => u.includes('%40'))
    expect(scopedCalls.length).toBeGreaterThan(0)
  })

  it('aggregates weekly range into weekly buckets', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('last-week')) {
        return Promise.resolve({ ok: true, json: async () => ({ downloads: 10000 }) })
      }
      if (url.includes('last-month')) {
        return Promise.resolve({ ok: true, json: async () => ({ downloads: 40000 }) })
      }
      // range: 28 days (4 weeks of 7 days each)
      const days = Array.from({ length: 28 }, (_, i) => ({
        day: `2026-01-${String(i + 1).padStart(2, '0')}`,
        downloads: 1000,
      }))
      return Promise.resolve({ ok: true, json: async () => ({ downloads: days }) })
    })

    const results = await fetchWalletLibraryDownloads()
    const first = results[0]
    // 28 days ÷ 7 = 4 buckets, each with 7000 total
    expect(first.trend.length).toBe(4)
    expect(first.trend[0].downloads).toBe(7000)
  })

  it('returns results sorted by weeklyDownloads descending', async () => {
    let callIndex = 0
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('last-week')) {
        // Give different values per library (decreasing)
        const val = (WALLET_LIBRARIES.length - Math.floor(callIndex++ / 3)) * 100000
        return Promise.resolve({ ok: true, json: async () => ({ downloads: val }) })
      }
      return Promise.resolve({ ok: true, json: async () => ({ downloads: 0 }) })
    })

    const results = await fetchWalletLibraryDownloads()
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].weeklyDownloads).toBeGreaterThanOrEqual(results[i + 1].weeklyDownloads)
    }
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Technology } from '@/types'

// ─── Fixture ─────────────────────────────────────────────────────────────────

const reactTech: Technology = {
  id: 'tech-react',
  slug: 'react',
  name: 'React',
  category: 'frontend',
  color: '#61DAFB',
  description: '',
  ecosystem: null,
  website_url: null,
  github_repo: null,
  npm_package: 'react',
  pypi_package: null,
  crates_package: null,
  stackoverflow_tag: 'reactjs',
  subreddit: null,
  devto_tag: null,
  aliases: [],
  first_appeared: null,
  maintained_by: null,
  is_active: true,
  created_at: '2020-01-01',
  updated_at: '2024-01-01',
  packagist_package: null,
  rubygems_package: null,
  nuget_package: null,
  pubdev_package: null,
}

const goTech: Technology = { ...reactTech, id: 'tech-go', slug: 'go', name: 'Go' }

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockClear()
  vi.stubGlobal('fetch', mockFetch)
})
afterEach(() => { vi.unstubAllGlobals() })

// ─── Import ──────────────────────────────────────────────────────────────────

import { fetchHackerNewsData } from '@/lib/api/hackernews'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('fetchHackerNewsData()', () => {
  it('returns 4 data points per tech (mentions, upvotes, comments, sentiment)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        hits: [
          { objectID: '1', title: 'React is awesome', url: null, points: 100, num_comments: 20, created_at_i: 0 },
          { objectID: '2', title: 'React 19 released', url: 'https://react.dev', points: 200, num_comments: 40, created_at_i: 0 },
        ],
        nbHits: 2,
        page: 0,
        nbPages: 1,
      }),
    })

    const result = await fetchHackerNewsData([reactTech])

    expect(result.source).toBe('hackernews')
    expect(result.dataPoints).toHaveLength(4)

    const mentions = result.dataPoints.find((dp) => dp.metric === 'mentions')
    expect(mentions?.value).toBe(2)

    const upvotes = result.dataPoints.find((dp) => dp.metric === 'upvotes')
    expect(upvotes?.value).toBe(150) // avg of 100 and 200

    const comments = result.dataPoints.find((dp) => dp.metric === 'comments')
    expect(comments?.value).toBe(30) // avg of 20 and 40

    const sentiment = result.dataPoints.find((dp) => dp.metric === 'sentiment')
    expect(typeof sentiment?.value).toBe('number')
  })

  it('returns zero-value data points when API returns empty hits', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hits: [], nbHits: 0, page: 0, nbPages: 0 }),
    })

    const result = await fetchHackerNewsData([reactTech])

    expect(result.dataPoints).toHaveLength(4)
    const mentions = result.dataPoints.find((dp) => dp.metric === 'mentions')
    expect(mentions?.value).toBe(0)

    const sentiment = result.dataPoints.find((dp) => dp.metric === 'sentiment')
    expect(sentiment?.value).toBe(0.5) // neutral default
  })

  it('uses disambiguation query for Go (go → "Go programming")', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hits: [], nbHits: 0, page: 0, nbPages: 0 }),
    })

    await fetchHackerNewsData([goTech])

    const calledUrl = (mockFetch.mock.calls[0] as string[])[0] as string
    expect(calledUrl).toContain('Go%20programming')
  })

  it('handles fetch errors gracefully (adds to errors, continues)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })

    const result = await fetchHackerNewsData([reactTech])

    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.dataPoints).toHaveLength(0)
  })

  it('processes multiple technologies', async () => {
    // React hits
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hits: [{ objectID: '1', title: 'React news', url: null, points: 50, num_comments: 5, created_at_i: 0 }], nbHits: 1, page: 0, nbPages: 1 }),
    })
    // Go hits
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hits: [], nbHits: 0, page: 0, nbPages: 0 }),
    })

    const result = await fetchHackerNewsData([reactTech, goTech])
    // 4 per tech
    expect(result.dataPoints).toHaveLength(8)
  })
})

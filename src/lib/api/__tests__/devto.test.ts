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
  devto_tag: 'react',
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

const noTagTech: Technology = { ...reactTech, id: 'tech-no-tag', devto_tag: null }

function makeArticle(id: number, reactions: number, comments: number) {
  return {
    id,
    title: `Article ${id}`,
    description: 'desc',
    url: `https://dev.to/${id}`,
    published_at: '2026-01-01T00:00:00Z',
    positive_reactions_count: reactions,
    comments_count: comments,
    tag_list: ['react'],
    user: { name: 'Dev', username: 'dev' },
  }
}

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockClear()
  vi.stubGlobal('fetch', mockFetch)
})
afterEach(() => { vi.unstubAllGlobals() })

// ─── Import ──────────────────────────────────────────────────────────────────

import { fetchDevToData } from '@/lib/api/devto'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('fetchDevToData()', () => {
  it('returns 3 data points per tech: articles, upvotes, comments', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        makeArticle(1, 50, 10),
        makeArticle(2, 100, 20),
        makeArticle(3, 30, 5),
      ],
    })

    const result = await fetchDevToData([reactTech])

    expect(result.source).toBe('devto')
    expect(result.dataPoints).toHaveLength(3)

    const articles = result.dataPoints.find((dp) => dp.metric === 'articles')
    expect(articles?.value).toBe(3)

    const upvotes = result.dataPoints.find((dp) => dp.metric === 'upvotes')
    expect(upvotes?.value).toBe(180) // 50+100+30

    const comments = result.dataPoints.find((dp) => dp.metric === 'comments')
    expect(comments?.value).toBe(35) // 10+20+5
  })

  it('returns zero-value data points when API returns empty array', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] })

    const result = await fetchDevToData([reactTech])

    expect(result.dataPoints).toHaveLength(3)
    expect(result.dataPoints.every((dp) => dp.value === 0)).toBe(true)
  })

  it('skips tech without devto_tag', async () => {
    const result = await fetchDevToData([noTagTech])
    expect(result.dataPoints).toHaveLength(0)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('handles API error gracefully (adds to errors)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })

    const result = await fetchDevToData([reactTech])
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toMatch(/react/)
  })

  it('handles 404 response (tag not found) → no data points', async () => {
    // dev.to returns null for 404 (fetchDevToArticles returns null)
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })

    const result = await fetchDevToData([reactTech])
    // 404 is treated as no articles → zero-value entries
    expect(result.dataPoints).toHaveLength(3)
    const articles = result.dataPoints.find((dp) => dp.metric === 'articles')
    expect(articles?.value).toBe(0)
  })

  it('sums reactions and comments correctly across multiple articles', async () => {
    const articles = Array.from({ length: 5 }, (_, i) => makeArticle(i, 100, 10))
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => articles })

    const result = await fetchDevToData([reactTech])
    const upvotes = result.dataPoints.find((dp) => dp.metric === 'upvotes')
    expect(upvotes?.value).toBe(500) // 5 × 100
  })
})

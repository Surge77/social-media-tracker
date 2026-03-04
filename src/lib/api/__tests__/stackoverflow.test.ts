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

const noTagTech: Technology = { ...reactTech, id: 'tech-no-tag', stackoverflow_tag: undefined as any }

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockClear()
  vi.stubGlobal('fetch', mockFetch)
  process.env.STACKOVERFLOW_API_KEY = 'so-key'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.STACKOVERFLOW_API_KEY
})

// ─── Import ──────────────────────────────────────────────────────────────────

import { fetchStackOverflowData } from '@/lib/api/stackoverflow'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('fetchStackOverflowData()', () => {
  it('returns questions and mentions data points for tech with SO tag', async () => {
    // Tag info response (total question count)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [{ count: 500000, name: 'reactjs', is_moderator_only: false, is_required: false, has_synonyms: true }],
        has_more: false,
        quota_max: 300,
        quota_remaining: 290,
      }),
    })
    // Recent questions response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], has_more: false, quota_max: 300, quota_remaining: 285, total: 1200 }),
    })

    const result = await fetchStackOverflowData([reactTech])

    expect(result.source).toBe('stackoverflow')
    expect(result.dataPoints).toHaveLength(2)

    const questions = result.dataPoints.find((dp) => dp.metric === 'questions')
    expect(questions?.value).toBe(500000)

    const mentions = result.dataPoints.find((dp) => dp.metric === 'mentions')
    expect(mentions?.value).toBe(1200)
  })

  it('returns error and empty data when API key is missing', async () => {
    delete process.env.STACKOVERFLOW_API_KEY
    const result = await fetchStackOverflowData([reactTech])
    expect(result.dataPoints).toHaveLength(0)
    expect(result.errors.some((e) => e.includes('STACKOVERFLOW_API_KEY'))).toBe(true)
  })

  it('skips tech without stackoverflow_tag', async () => {
    const result = await fetchStackOverflowData([noTagTech])
    expect(result.dataPoints).toHaveLength(0)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('handles API error (adds to errors, continues)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 })

    const result = await fetchStackOverflowData([reactTech])
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('still returns mentions when tag info returns empty items', async () => {
    // Tag info with no items (tag doesn't exist)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], has_more: false, quota_max: 300, quota_remaining: 285 }),
    })
    // Recent questions
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], has_more: false, quota_max: 300, quota_remaining: 285, total: 0 }),
    })

    const result = await fetchStackOverflowData([reactTech])
    // Only mentions (no questions because tag info returned nothing)
    const mentions = result.dataPoints.find((dp) => dp.metric === 'mentions')
    expect(mentions?.value).toBe(0)
    const questions = result.dataPoints.find((dp) => dp.metric === 'questions')
    expect(questions).toBeUndefined()
  })
})

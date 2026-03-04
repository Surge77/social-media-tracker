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
  github_repo: 'facebook/react',
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

// Tech without a github_repo — should be skipped
const noRepoTech: Technology = { ...reactTech, id: 'tech-no-repo', github_repo: null }

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockClear()
  vi.stubGlobal('fetch', mockFetch)
  process.env.GITHUB_TOKEN = 'ghp_test-token'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.GITHUB_TOKEN
})

// ─── Import ──────────────────────────────────────────────────────────────────

import { fetchGitHubData } from '@/lib/api/github'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('fetchGitHubData()', () => {
  it('returns 4 data points: stars, forks, open_issues, watchers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        stargazers_count: 220000,
        forks_count: 45000,
        open_issues_count: 1200,
        watchers_count: 220000,
        subscribers_count: 6800,
      }),
    })

    const result = await fetchGitHubData([reactTech])

    expect(result.source).toBe('github')
    expect(result.dataPoints).toHaveLength(4)
    expect(result.errors).toHaveLength(0)

    const stars = result.dataPoints.find((dp) => dp.metric === 'stars')
    expect(stars?.value).toBe(220000)

    const forks = result.dataPoints.find((dp) => dp.metric === 'forks')
    expect(forks?.value).toBe(45000)

    const issues = result.dataPoints.find((dp) => dp.metric === 'open_issues')
    expect(issues?.value).toBe(1200)

    // watchers: prefers subscribers_count over watchers_count
    const watchers = result.dataPoints.find((dp) => dp.metric === 'watchers')
    expect(watchers?.value).toBe(6800)
  })

  it('uses GITHUB_TOKEN auth header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stargazers_count: 1, forks_count: 0, open_issues_count: 0, watchers_count: 0, subscribers_count: 0 }),
    })

    await fetchGitHubData([reactTech])

    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit]
    const headers = callArgs[1]?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer ghp_test-token')
  })

  it('handles 404 response gracefully (adds to errors, no data points)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })

    const result = await fetchGitHubData([reactTech])

    expect(result.dataPoints).toHaveLength(0)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toMatch(/404/)
  })

  it('skips techs without github_repo', async () => {
    const result = await fetchGitHubData([noRepoTech])
    expect(result.dataPoints).toHaveLength(0)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns error and empty data when GITHUB_TOKEN is missing', async () => {
    delete process.env.GITHUB_TOKEN
    const result = await fetchGitHubData([reactTech])
    expect(result.dataPoints).toHaveLength(0)
    expect(result.errors.some((e) => e.includes('GITHUB_TOKEN'))).toBe(true)
  })

  it('processes multiple techs', async () => {
    const vueTech = { ...reactTech, id: 'tech-vue', slug: 'vue', github_repo: 'vuejs/core' }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stargazers_count: 220000, forks_count: 45000, open_issues_count: 1200, watchers_count: 0, subscribers_count: 6800 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stargazers_count: 46000, forks_count: 8000, open_issues_count: 400, watchers_count: 0, subscribers_count: 2000 }),
      })

    const result = await fetchGitHubData([reactTech, vueTech])
    // 4 per tech
    expect(result.dataPoints).toHaveLength(8)
  })
})

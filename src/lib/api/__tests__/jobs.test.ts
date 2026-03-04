import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Technology } from '@/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseTech: Technology = {
  id: 'tech-1',
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

const cppTech: Technology = {
  ...baseTech,
  id: 'tech-cpp',
  slug: 'cpp',
  name: 'C++',
  aliases: ['cpp', 'c-plus-plus'],
}

const goTech: Technology = {
  ...baseTech,
  id: 'tech-go',
  slug: 'go',
  name: 'Go',
  aliases: ['golang'],
}

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockClear()
  vi.stubGlobal('fetch', mockFetch)
  // Set env vars for all sources
  process.env.ADZUNA_APP_ID = 'app-id'
  process.env.ADZUNA_API_KEY = 'api-key'
  process.env.RAPIDAPI_KEY = 'rapid-key'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.ADZUNA_APP_ID
  delete process.env.ADZUNA_API_KEY
  delete process.env.RAPIDAPI_KEY
})

// ─── Import ──────────────────────────────────────────────────────────────────

import { fetchJobsData } from '@/lib/api/jobs'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('fetchJobsData()', () => {
  it('returns data points from all sources (remotive + adzuna + jsearch)', async () => {
    // Remotive
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobs: [
          { id: 1, title: 'React Developer', description: 'We need a React developer', company_name: 'Acme', url: 'https://x.com' },
          { id: 2, title: 'Frontend Engineer', description: 'React and TypeScript required', company_name: 'Corp', url: 'https://y.com' },
        ],
      }),
    })
    // Adzuna
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], count: 500 }),
    })
    // JSearch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'OK', data: [], estimated_total_results: 1200 }),
    })

    const result = await fetchJobsData([baseTech])

    expect(result.source).toBe('jobs')
    expect(result.dataPoints.length).toBeGreaterThanOrEqual(3)

    const remotiveDp = result.dataPoints.find((dp) => dp.source === 'remotive')
    expect(remotiveDp).toBeDefined()
    expect(remotiveDp!.metric).toBe('job_postings')
    // React is mentioned in both jobs
    expect(remotiveDp!.value).toBe(2)

    const adzunaDp = result.dataPoints.find((dp) => dp.source === 'adzuna')
    expect(adzunaDp!.value).toBe(500)

    const jsearchDp = result.dataPoints.find((dp) => dp.source === 'jsearch')
    expect(jsearchDp!.value).toBe(1200)
  })

  it('returns 0 for remotive when API returns error', async () => {
    // Remotive fails
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    // Adzuna
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ results: [], count: 0 }) })
    // JSearch
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'OK', data: [], estimated_total_results: 0 }) })

    const result = await fetchJobsData([baseTech])
    // Remotive error → no remotive data point
    const remotive = result.dataPoints.find((dp) => dp.source === 'remotive')
    expect(remotive).toBeUndefined()
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('handles Go tech with search term override (golang)', async () => {
    // Remotive has golang jobs
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobs: [{ id: 1, title: 'Golang Backend Dev', description: 'We need a golang developer', company_name: 'X', url: 'x' }],
      }),
    })
    // Adzuna + JSearch
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ results: [], count: 200 }) })
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'OK', data: [], estimated_total_results: 300 }) })

    const result = await fetchJobsData([goTech])
    const adzunaUrl = (mockFetch.mock.calls[1] as string[])[0]
    // Should use 'golang developer' not just 'go developer'
    expect(adzunaUrl).toContain('golang')
  })

  it('handles missing env vars gracefully (no adzuna/jsearch data points)', async () => {
    delete process.env.ADZUNA_APP_ID
    delete process.env.ADZUNA_API_KEY
    delete process.env.RAPIDAPI_KEY

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: [] }),
    })

    const result = await fetchJobsData([baseTech])
    const adzunaDp = result.dataPoints.find((dp) => dp.source === 'adzuna')
    const jsearchDp = result.dataPoints.find((dp) => dp.source === 'jsearch')
    expect(adzunaDp).toBeUndefined()
    expect(jsearchDp).toBeUndefined()
    expect(result.errors.some((e) => e.includes('ADZUNA'))).toBe(true)
  })
})

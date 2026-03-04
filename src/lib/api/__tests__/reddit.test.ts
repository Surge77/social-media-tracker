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
  subreddit: 'reactjs',
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

// Tech without subreddit — should be skipped
const noSubredditTech: Technology = { ...reactTech, id: 'tech-no-sub', subreddit: null }

// ─── Mock fetch ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  process.env.REDDIT_CLIENT_ID = 'client-id'
  process.env.REDDIT_CLIENT_SECRET = 'client-secret'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.REDDIT_CLIENT_ID
  delete process.env.REDDIT_CLIENT_SECRET
})

// ─── Mock token response ──────────────────────────────────────────────────────

function mockTokenResponse() {
  return {
    ok: true,
    json: async () => ({
      access_token: 'test-token',
      token_type: 'bearer',
      expires_in: 3600,
      scope: '*',
    }),
  }
}

function mockPostsResponse(count: number, avgScore = 100) {
  const children = Array.from({ length: count }, (_, i) => ({
    kind: 't3',
    data: {
      id: `post-${i}`,
      title: `Post about React ${i}`,
      author: 'user',
      score: avgScore,
      num_comments: 10,
      created_utc: Date.now() / 1000,
      permalink: '/r/reactjs/comments/x',
      url: 'https://reddit.com/x',
      selftext: '',
      subreddit: 'reactjs',
    },
  }))
  return {
    ok: true,
    json: async () => ({
      kind: 'Listing',
      data: { children, after: null, before: null },
    }),
  }
}

// ─── Import — use dynamic import to reset module-level cached token ───────────

describe('fetchRedditData()', { timeout: 10000 }, () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns error and empty data when credentials are missing', async () => {
    delete process.env.REDDIT_CLIENT_ID

    // Dynamic import to get fresh module state
    const { fetchRedditData } = await import('@/lib/api/reddit')
    const result = await fetchRedditData([reactTech])

    expect(result.source).toBe('reddit')
    expect(result.dataPoints).toHaveLength(0)
    expect(result.errors.some((e) => e.includes('REDDIT_CLIENT_ID'))).toBe(true)
  })

  it('returns 4 data points per tech (posts, upvotes, comments, sentiment)', async () => {
    // Token + posts
    mockFetch.mockResolvedValueOnce(mockTokenResponse())
    mockFetch.mockResolvedValueOnce(mockPostsResponse(5, 80))

    const { fetchRedditData } = await import('@/lib/api/reddit')
    const result = await fetchRedditData([reactTech])

    expect(result.source).toBe('reddit')
    expect(result.dataPoints).toHaveLength(4)

    const posts = result.dataPoints.find((dp) => dp.metric === 'posts')
    expect(posts?.value).toBe(5)

    const upvotes = result.dataPoints.find((dp) => dp.metric === 'upvotes')
    expect(upvotes?.value).toBe(80)

    const sentiment = result.dataPoints.find((dp) => dp.metric === 'sentiment')
    expect(typeof sentiment?.value).toBe('number')
  })

  it('skips tech with no subreddit', async () => {
    mockFetch.mockResolvedValueOnce(mockTokenResponse())

    const { fetchRedditData } = await import('@/lib/api/reddit')
    const result = await fetchRedditData([noSubredditTech])

    // Only token call, no posts call
    expect(result.dataPoints).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it('returns zero-value data points when subreddit has no posts', async () => {
    mockFetch.mockResolvedValueOnce(mockTokenResponse())
    mockFetch.mockResolvedValueOnce(mockPostsResponse(0))

    const { fetchRedditData } = await import('@/lib/api/reddit')
    const result = await fetchRedditData([reactTech])

    expect(result.dataPoints).toHaveLength(4)
    const posts = result.dataPoints.find((dp) => dp.metric === 'posts')
    expect(posts?.value).toBe(0)
  })
})

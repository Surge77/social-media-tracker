const GITHUB_API_BASE = 'https://api.github.com'
const HN_ALGOLIA_API  = 'https://hn.algolia.com/api/v1'

export interface TrendingRepo {
  github_id: number
  full_name: string
  description: string | null
  language: string | null
  stars_total: number
  stars_gained: number
  forks: number
  open_issues: number
  topics: string[]
  last_pushed_at: string | null
  period: string
  html_url: string
  owner_avatar_url: string
  // Community buzz (optional — present when repo is discussed on HN)
  hn_points?: number
  hn_comments?: number
  hn_title?: string
  hn_url?: string
  hn_age_hours?: number
}

export interface BuzzItem {
  full_name: string
  hn_title: string
  hn_points: number
  hn_comments: number
  hn_url: string
  hn_age_hours: number
  html_url: string
  description: string | null
  language: string | null
  stars_total: number
  owner_avatar_url: string
}

function getPeriodDate(period: '24h' | '7d' | '30d'): string {
  const now = new Date()
  if (period === '24h') now.setDate(now.getDate() - 1)
  else if (period === '7d') now.setDate(now.getDate() - 7)
  else now.setDate(now.getDate() - 30)
  return now.toISOString().split('T')[0]
}

/** Fetch up to 100 trending GitHub repos for a given language × period */
export async function fetchTrendingRepos(
  language: string,
  period: '24h' | '7d' | '30d'
): Promise<TrendingRepo[]> {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN not configured')

  const sinceDate = getPeriodDate(period)
  const langQuery = language && language !== 'all'
    ? `+language:${encodeURIComponent(language)}`
    : ''
  const url = `${GITHUB_API_BASE}/search/repositories?q=created:>=${sinceDate}${langQuery}&sort=stars&order=desc&per_page=100`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 1800 }, // 30-min cache
  })

  if (!response.ok) throw new Error(`GitHub API error ${response.status}`)

  const data: GitHubSearchResponse = await response.json()

  return data.items.map((item) => ({
    github_id: item.id,
    full_name: item.full_name,
    description: item.description,
    language: item.language,
    stars_total: item.stargazers_count,
    stars_gained: 0,
    forks: item.forks_count,
    open_issues: item.open_issues_count,
    topics: item.topics ?? [],
    last_pushed_at: item.pushed_at,
    period,
    html_url: item.html_url,
    owner_avatar_url: item.owner?.avatar_url ?? '',
  }))
}

/**
 * Fetch repos currently being discussed on Hacker News.
 * Uses HN Algolia API (free, no auth, ~15-min freshness).
 * Returns repos sorted by HN points descending.
 */
export async function fetchHNBuzz(): Promise<BuzzItem[]> {
  // Parallel: high-signal (>30 pts, last few days) + very fresh (>5 pts, last 24h)
  const [hotRes, freshRes] = await Promise.allSettled([
    fetch(
      `${HN_ALGOLIA_API}/search_by_date?query=github.com&tags=story&numericFilters=points>30&hitsPerPage=50`,
      { next: { revalidate: 900 } }
    ),
    fetch(
      `${HN_ALGOLIA_API}/search_by_date?query=github.com&tags=story&numericFilters=points>5&hitsPerPage=30`,
      { next: { revalidate: 900 } }
    ),
  ])

  const rawHits: HNHit[] = []
  if (hotRes.status === 'fulfilled' && hotRes.value.ok) {
    const d: HNSearchResponse = await hotRes.value.json()
    rawHits.push(...(d.hits ?? []))
  }
  if (freshRes.status === 'fulfilled' && freshRes.value.ok) {
    const d: HNSearchResponse = await freshRes.value.json()
    rawHits.push(...(d.hits ?? []))
  }

  if (rawHits.length === 0) return []

  // Deduplicate by objectID, keep highest-point entry
  const byId = new Map<string, HNHit>()
  for (const h of rawHits) {
    const ex = byId.get(h.objectID)
    if (!ex || h.points > ex.points) byId.set(h.objectID, h)
  }

  const now = Date.now()
  const buzz: BuzzItem[] = []

  for (const hit of byId.values()) {
    if (!hit.url) continue

    // Extract owner/repo from GitHub URL
    const m = hit.url.match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/)
    if (!m) continue
    const fullName = m[1].replace(/\.git$/, '')
    // Skip non-repo sub-pages
    if (/\/(blob|tree|issues|pull|releases|wiki)/.test(hit.url)) continue

    buzz.push({
      full_name:       fullName,
      hn_title:        hit.title,
      hn_points:       hit.points,
      hn_comments:     hit.num_comments,
      hn_url:          `https://news.ycombinator.com/item?id=${hit.objectID}`,
      hn_age_hours:    Math.round((now - hit.created_at_i * 1000) / 3_600_000),
      html_url:        `https://github.com/${fullName}`,
      description:     null,
      language:        null,
      stars_total:     0,
      owner_avatar_url: `https://github.com/${fullName.split('/')[0]}.png?size=48`,
    })
  }

  return buzz.sort((a, b) => b.hn_points - a.hn_points).slice(0, 20)
}

/**
 * Annotate trending repos with HN buzz data where repo names match.
 * Also sorts so HN-buzzing repos surface first within the list.
 */
export function annotateBuzz(repos: TrendingRepo[], buzz: BuzzItem[]): TrendingRepo[] {
  const map = new Map(buzz.map((b) => [b.full_name.toLowerCase(), b]))
  return repos.map((repo) => {
    const b = map.get(repo.full_name.toLowerCase())
    if (!b) return repo
    return {
      ...repo,
      hn_points:    b.hn_points,
      hn_comments:  b.hn_comments,
      hn_title:     b.hn_title,
      hn_url:       b.hn_url,
      hn_age_hours: b.hn_age_hours,
    }
  })
}

// ── Internal types ─────────────────────────────────────────────────────────────

interface GitHubSearchResponse { total_count: number; items: GitHubRepo[] }

interface GitHubRepo {
  id: number
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  topics?: string[]
  pushed_at: string
  html_url: string
  owner: { avatar_url: string } | null
}

interface HNSearchResponse { hits: HNHit[] }

interface HNHit {
  objectID: string
  title: string
  url: string | null
  points: number
  num_comments: number
  created_at_i: number
}

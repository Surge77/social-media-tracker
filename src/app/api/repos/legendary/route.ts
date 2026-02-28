import { NextRequest } from 'next/server'

const GITHUB_API_BASE = 'https://api.github.com'

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
  owner: { avatar_url: string; login: string } | null
}

interface GitHubSearchResponse {
  total_count: number
  items: GitHubRepo[]
}

export interface LegendaryRepo {
  github_id: number
  full_name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  topics: string[]
  html_url: string
  owner_avatar_url: string
}

async function fetchTopRepos(sortBy: 'stars' | 'forks', perPage: number): Promise<LegendaryRepo[]> {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN not configured')

  // stars:>50000 ensures we only get legitimately massive repos
  const url = `${GITHUB_API_BASE}/search/repositories?q=stars:>50000&sort=${sortBy}&order=desc&per_page=${perPage}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 86400 }, // 24-hour cache — this list barely moves
  })

  if (!res.ok) throw new Error(`GitHub API error ${res.status}`)

  const data: GitHubSearchResponse = await res.json()

  return data.items.map((item) => ({
    github_id: item.id,
    full_name: item.full_name,
    description: item.description,
    language: item.language,
    stars: item.stargazers_count,
    forks: item.forks_count,
    topics: item.topics ?? [],
    html_url: item.html_url,
    owner_avatar_url: item.owner?.avatar_url ?? '',
  }))
}

export async function GET(_request: NextRequest) {
  try {
    const [byStars, byForks] = await Promise.all([
      fetchTopRepos('stars', 100), // max GitHub allows — top 100 most-starred repos ever
      fetchTopRepos('forks', 20),  // forks list converges fast; 20 is plenty
    ])

    return Response.json(
      { byStars, byForks },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}

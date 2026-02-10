import type { Technology, FetcherResult, DataPoint } from '@/types'

const GITHUB_API_BASE = 'https://api.github.com'
const DELAY_MS = 100 // Polite delay between requests

/**
 * Fetch GitHub repository metrics for all technologies with a github_repo.
 * Returns data_points for: stars, forks, open_issues, watchers
 */
export async function fetchGitHubData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    errors.push('GITHUB_TOKEN not configured')
    return { source: 'github', dataPoints, errors }
  }

  // Filter technologies that have a GitHub repo
  const techsWithRepo = technologies.filter((t) => t.github_repo)

  for (let i = 0; i < techsWithRepo.length; i++) {
    const tech = techsWithRepo[i]

    try {
      const repoData = await fetchRepoData(tech.github_repo!, token)

      if (repoData) {
        // stars
        dataPoints.push({
          technology_id: tech.id,
          source: 'github',
          metric: 'stars',
          value: repoData.stargazers_count,
          metadata: {},
          measured_at: today,
        })

        // forks
        dataPoints.push({
          technology_id: tech.id,
          source: 'github',
          metric: 'forks',
          value: repoData.forks_count,
          metadata: {},
          measured_at: today,
        })

        // open_issues
        dataPoints.push({
          technology_id: tech.id,
          source: 'github',
          metric: 'open_issues',
          value: repoData.open_issues_count,
          metadata: {},
          measured_at: today,
        })

        // watchers (use subscribers_count if available, otherwise watchers_count)
        const watcherCount = repoData.subscribers_count || repoData.watchers_count
        dataPoints.push({
          technology_id: tech.id,
          source: 'github',
          metric: 'watchers',
          value: watcherCount,
          metadata: {},
          measured_at: today,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`${tech.slug}: ${errorMsg}`)
      // Continue to next technology - one failure shouldn't stop the entire fetch
    }

    // Polite delay between requests
    if (i < techsWithRepo.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  return { source: 'github', dataPoints, errors }
}

/**
 * Fetch data for a single GitHub repository
 */
async function fetchRepoData(
  repo: string, // format: "owner/repo"
  token: string
): Promise<GitHubRepoResponse | null> {
  const url = `${GITHUB_API_BASE}/repos/${repo}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  // Handle errors gracefully
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repo not found (404): ${repo}`)
    }
    if (response.status === 403) {
      throw new Error(`Rate limited or forbidden (403): ${repo}`)
    }
    throw new Error(`GitHub API error ${response.status}: ${repo}`)
  }

  return response.json()
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * GitHub API response shape (subset of fields we care about)
 */
interface GitHubRepoResponse {
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  watchers_count: number
  subscribers_count: number
}

import type { Technology, FetcherResult } from '@/types'

const GITHUB_BASE = 'https://api.github.com'
const TODAY = new Date().toISOString().split('T')[0]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch with 202 retry — GitHub computes contributor/commit stats on-demand.
 * A 202 means "computing, retry later". Retries up to maxRetries times.
 */
async function fetchWithRetry(
  url: string,
  headers: HeadersInit,
  maxRetries = 3
): Promise<Response | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, { headers })
    if (res.status === 202) {
      await sleep(2000)
      continue
    }
    return res
  }
  return null // still 202 after maxRetries
}

/**
 * Source 1: GitHub Contributor Counts & Commit Velocity
 *
 * Per repo fetches:
 *   - /stats/contributors  → active_contributors (≥1 commit in last 4 weeks)
 *   - /stats/commit_activity → commit_velocity (avg commits/week over last 4 weeks)
 *   - /search/issues → closed_issues count (for real issueCloseRate)
 *
 * Rate: ~3 calls/repo × 100 repos = 300 calls. Well within 5,000/hr limit.
 */
export async function fetchGitHubStats(
  technologies: Technology[]
): Promise<FetcherResult> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return { source: 'github', dataPoints: [], errors: ['GITHUB_TOKEN not set'] }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const techs = technologies.filter((t) => t.github_repo)

  for (const tech of techs) {
    const repo = tech.github_repo!
    const now = Math.floor(Date.now() / 1000)
    const fourWeeksAgo = now - 28 * 24 * 3600

    try {
      // 1. Contributor stats → active_contributors
      const contribRes = await fetchWithRetry(
        `${GITHUB_BASE}/repos/${repo}/stats/contributors`,
        headers
      )

      if (contribRes && contribRes.ok) {
        const contribData = await contribRes.json()
        if (Array.isArray(contribData)) {
          const activeContributors = contribData.filter((contributor) => {
            if (!Array.isArray(contributor.weeks)) return false
            return contributor.weeks.some(
              (week: { w: number; c: number }) => week.w >= fourWeeksAgo && week.c > 0
            )
          }).length

          dataPoints.push({
            technology_id: tech.id,
            source: 'github',
            metric: 'active_contributors',
            value: activeContributors,
            metadata: { repo },
            measured_at: TODAY,
          })
        }
      } else if (contribRes) {
        errors.push(`${repo}: contributors ${contribRes.status}`)
      } else {
        errors.push(`${repo}: contributors still 202 after retries`)
      }

      // 2. Commit activity → commit_velocity (avg commits/week over last 4 weeks)
      const commitRes = await fetchWithRetry(
        `${GITHUB_BASE}/repos/${repo}/stats/commit_activity`,
        headers
      )

      if (commitRes && commitRes.ok) {
        const commitData: Array<{ week: number; total: number }> = await commitRes.json()
        if (Array.isArray(commitData)) {
          const recent = commitData.filter((w) => w.week >= fourWeeksAgo)
          const avgCommitsPerWeek =
            recent.length > 0
              ? recent.reduce((sum, w) => sum + w.total, 0) / recent.length
              : 0

          dataPoints.push({
            technology_id: tech.id,
            source: 'github',
            metric: 'commit_velocity',
            value: Math.round(avgCommitsPerWeek * 10) / 10,
            metadata: { repo, weeks_sampled: recent.length },
            measured_at: TODAY,
          })
        }
      } else if (commitRes) {
        errors.push(`${repo}: commit_activity ${commitRes.status}`)
      } else {
        errors.push(`${repo}: commit_activity still 202 after retries`)
      }

      // 3. Closed issues count (for real issueCloseRate)
      const closedRes = await fetch(
        `${GITHUB_BASE}/search/issues?q=repo:${repo}+type:issue+state:closed&per_page=1`,
        { headers }
      )

      if (closedRes.ok) {
        const closedData: { total_count: number } = await closedRes.json()
        dataPoints.push({
          technology_id: tech.id,
          source: 'github',
          metric: 'closed_issues',
          value: closedData.total_count,
          metadata: { repo },
          measured_at: TODAY,
        })
      } else {
        errors.push(`${repo}: closed_issues search ${closedRes.status}`)
      }

      // Small delay between repos to be a good API citizen
      await sleep(200)
    } catch (err) {
      errors.push(`${repo}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `[GitHub Stats] ${dataPoints.length} data points from ${techs.length} repos, ${errors.length} errors`
  )

  return { source: 'github', dataPoints, errors }
}

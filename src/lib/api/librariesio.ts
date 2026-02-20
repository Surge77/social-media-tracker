import type { Technology, FetcherResult } from '@/types'

const LIBRARIESIO_BASE = 'https://libraries.io/api'
const TODAY = new Date().toISOString().split('T')[0]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Platform mapping: check fields in order, use first non-null identifier.
 * Go is intentionally excluded — proxy.golang.org doesn't map to Libraries.io platform names.
 */
const PLATFORM_CHECKS: Array<{ field: keyof Technology; platform: string }> = [
  { field: 'npm_package',       platform: 'npm' },
  { field: 'pypi_package',      platform: 'pypi' },
  { field: 'crates_package',    platform: 'cargo' },
  { field: 'rubygems_package',  platform: 'rubygems' },
  { field: 'nuget_package',     platform: 'nuget' },
  { field: 'packagist_package', platform: 'packagist' },
  { field: 'pubdev_package',    platform: 'pub' },
]

interface LibrariesIOResponse {
  dependent_repos_count?: number
  dependents_count?: number
  rank?: number                   // sourcerank (0-30+)
  latest_release_published_at?: string | null
}

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.floor(ms / 86400000)
}

/**
 * Source 2: Libraries.io adoption signals
 *
 * Provides:
 *   - dependents_count: packages that depend on this
 *   - dependent_repos_count: GitHub repos that use this
 *   - sourcerank: Libraries.io quality score (0-30+)
 *   - latest_release_age: days since last release (stored in raw_sub_scores only)
 *
 * Rate limit: 60 req/min. Runs every 3 days via last-successful-run check.
 * Processes in chunks of 50 to stay within Vercel 60s timeout.
 */
export async function fetchLibrariesIOData(
  technologies: Technology[],
  supabase: import('@supabase/supabase-js').SupabaseClient
): Promise<FetcherResult & { latestReleaseAgeMap: Map<string, number | null> }> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []
  const latestReleaseAgeMap = new Map<string, number | null>()

  const apiKey = process.env.LIBRARIESIO_API_KEY
  if (!apiKey) {
    return {
      source: 'librariesio',
      dataPoints: [],
      errors: ['LIBRARIESIO_API_KEY not set'],
      latestReleaseAgeMap,
    }
  }

  // Cadence check: run at most every 72 hours
  const { data: lastRun } = await supabase
    .from('fetch_logs')
    .select('completed_at')
    .eq('source', 'librariesio')
    .eq('status', 'success')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastRunAt = lastRun?.completed_at ? new Date(lastRun.completed_at) : null
  const hoursSinceLastRun = lastRunAt
    ? (Date.now() - lastRunAt.getTime()) / 3600000
    : Infinity

  if (hoursSinceLastRun < 72) {
    console.log(`[Libraries.io] Skipping — last successful run ${Math.round(hoursSinceLastRun)}h ago (< 72h)`)
    return {
      source: 'librariesio',
      dataPoints: [],
      errors: [`Skipped — runs every 3 days (last run ${Math.round(hoursSinceLastRun)}h ago)`],
      latestReleaseAgeMap,
    }
  }

  // Build list of (tech, platform, packageName) tuples
  const targets: Array<{ tech: Technology; platform: string; packageName: string }> = []

  for (const tech of technologies) {
    for (const { field, platform } of PLATFORM_CHECKS) {
      const packageName = tech[field] as string | null
      if (packageName) {
        targets.push({ tech, platform, packageName })
        break // use first available platform
      }
    }
  }

  // Process in chunks of 50 to avoid Vercel timeout
  const CHUNK_SIZE = 50
  const deadline = Date.now() + 55_000 // 55s max, leave 5s buffer

  for (let i = 0; i < targets.length; i++) {
    if (Date.now() > deadline) {
      errors.push(`Timeout: processed ${i} of ${targets.length} technologies`)
      break
    }

    const { tech, platform, packageName } = targets[i]

    try {
      const url = `${LIBRARIESIO_BASE}/${platform}/${encodeURIComponent(packageName)}?api_key=${apiKey}`
      const res = await fetch(url)

      if (res.status === 404) {
        // Package not found on this platform — skip silently
        continue
      }

      if (res.status === 429) {
        // Rate limited — wait 10s and retry once
        await sleep(10_000)
        const retryRes = await fetch(url)
        if (!retryRes.ok) {
          errors.push(`${tech.name}: rate limited, retry failed ${retryRes.status}`)
          continue
        }
        const data: LibrariesIOResponse = await retryRes.json()
        processResponse(tech, data, dataPoints, latestReleaseAgeMap)
      } else if (res.ok) {
        const data: LibrariesIOResponse = await res.json()
        processResponse(tech, data, dataPoints, latestReleaseAgeMap)
      } else {
        errors.push(`${tech.name}: ${res.status}`)
      }

      // 1 second between requests to stay within 60 req/min
      await sleep(1000)
    } catch (err) {
      errors.push(`${tech.name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `[Libraries.io] ${dataPoints.length} data points from ${targets.length} packages, ${errors.length} errors`
  )

  return { source: 'librariesio', dataPoints, errors, latestReleaseAgeMap }
}

function processResponse(
  tech: Technology,
  data: LibrariesIOResponse,
  dataPoints: FetcherResult['dataPoints'],
  latestReleaseAgeMap: Map<string, number | null>
): void {
  if (data.dependents_count != null) {
    dataPoints.push({
      technology_id: tech.id,
      source: 'librariesio',
      metric: 'dependents_count',
      value: data.dependents_count,
      metadata: {},
      measured_at: TODAY,
    })
  }

  if (data.dependent_repos_count != null) {
    dataPoints.push({
      technology_id: tech.id,
      source: 'librariesio',
      metric: 'dependent_repos_count',
      value: data.dependent_repos_count,
      metadata: {},
      measured_at: TODAY,
    })
  }

  if (data.rank != null) {
    dataPoints.push({
      technology_id: tech.id,
      source: 'librariesio',
      metric: 'sourcerank',
      value: data.rank,
      metadata: {},
      measured_at: TODAY,
    })
  }

  // latest_release_age stored in map for raw_sub_scores, not as a data_point
  const ageInDays = daysSince(data.latest_release_published_at)
  latestReleaseAgeMap.set(tech.id, ageInDays)
}

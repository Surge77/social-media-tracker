import type { Technology, FetcherResult } from '@/types'

const TODAY = new Date().toISOString().split('T')[0]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Source 4: Additional Package Registries
 *
 * Covers PHP/Ruby/C#/Dart ecosystems that packages.ts (npm/PyPI/crates) misses.
 * Go and Maven are excluded — better served by Libraries.io dependents_count.
 *
 * Registries:
 *   - Packagist (PHP): monthly downloads
 *   - RubyGems (Ruby): total downloads
 *   - NuGet (C#): total downloads
 *   - pub.dev (Dart/Flutter): like count (stored as 'likes', NOT merged into downloads)
 */
export async function fetchExtendedPackageDownloads(
  technologies: Technology[]
): Promise<FetcherResult> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []

  // Run all registry fetchers in parallel per registry
  const [packagistResults, rubygemsResults, nugetResults, pubdevResults] = await Promise.allSettled([
    fetchPackagist(technologies),
    fetchRubyGems(technologies),
    fetchNuGet(technologies),
    fetchPubDev(technologies),
  ])

  for (const result of [packagistResults, rubygemsResults, nugetResults, pubdevResults]) {
    if (result.status === 'fulfilled') {
      dataPoints.push(...result.value.dataPoints)
      errors.push(...result.value.errors)
    } else {
      errors.push(`Registry fetch failed: ${result.reason}`)
    }
  }

  console.log(
    `[Extended Packages] ${dataPoints.length} data points, ${errors.length} errors`
  )

  // Return a generic source — individual points carry their own source field
  return { source: 'packages', dataPoints, errors }
}

// ---- Packagist (PHP) ----

async function fetchPackagist(
  technologies: Technology[]
): Promise<FetcherResult> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []

  const techs = technologies.filter((t) => t.packagist_package)

  for (const tech of techs) {
    const pkg = tech.packagist_package!
    try {
      const res = await fetch(`https://packagist.org/packages/${pkg}.json`)
      if (!res.ok) {
        errors.push(`Packagist ${pkg}: ${res.status}`)
        continue
      }
      const data: { package?: { downloads?: { monthly?: number } } } = await res.json()
      const monthly = data?.package?.downloads?.monthly
      if (monthly != null) {
        dataPoints.push({
          technology_id: tech.id,
          source: 'packagist',
          metric: 'downloads',
          value: monthly,
          metadata: { package: pkg, period: 'monthly' },
          measured_at: TODAY,
        })
      }
      await sleep(100)
    } catch (err) {
      errors.push(`Packagist ${pkg}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { source: 'packagist', dataPoints, errors }
}

// ---- RubyGems (Ruby) ----

async function fetchRubyGems(
  technologies: Technology[]
): Promise<FetcherResult> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []

  const techs = technologies.filter((t) => t.rubygems_package)

  for (const tech of techs) {
    const gem = tech.rubygems_package!
    try {
      const res = await fetch(`https://rubygems.org/api/v1/gems/${gem}.json`)
      if (!res.ok) {
        errors.push(`RubyGems ${gem}: ${res.status}`)
        continue
      }
      const data: { downloads?: number } = await res.json()
      if (data.downloads != null) {
        dataPoints.push({
          technology_id: tech.id,
          source: 'rubygems',
          metric: 'downloads',
          value: data.downloads,
          metadata: { gem },
          measured_at: TODAY,
        })
      }
      await sleep(100)
    } catch (err) {
      errors.push(`RubyGems ${gem}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { source: 'rubygems', dataPoints, errors }
}

// ---- NuGet (C#) ----

interface NuGetResult {
  data?: Array<{ totalDownloads?: number }>
}

async function fetchNuGet(
  technologies: Technology[]
): Promise<FetcherResult> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []

  const techs = technologies.filter((t) => t.nuget_package)

  for (const tech of techs) {
    const pkg = tech.nuget_package!
    try {
      const url = `https://azuresearch-usnc.nuget.org/query?q=${encodeURIComponent(pkg)}&prerelease=false&take=1`
      const res = await fetch(url)
      if (!res.ok) {
        errors.push(`NuGet ${pkg}: ${res.status}`)
        continue
      }
      const data: NuGetResult = await res.json()
      const totalDownloads = data?.data?.[0]?.totalDownloads
      if (totalDownloads != null) {
        dataPoints.push({
          technology_id: tech.id,
          source: 'nuget',
          metric: 'downloads',
          value: totalDownloads,
          metadata: { package: pkg },
          measured_at: TODAY,
        })
      }
      await sleep(100)
    } catch (err) {
      errors.push(`NuGet ${pkg}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { source: 'nuget', dataPoints, errors }
}

// ---- pub.dev (Dart/Flutter) ----
// Note: likeCount is NOT a download count. Stored as 'likes', not merged into downloads.

interface PubDevScore {
  likeCount?: number
  popularityScore?: number
}

async function fetchPubDev(
  technologies: Technology[]
): Promise<FetcherResult> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []

  const techs = technologies.filter((t) => t.pubdev_package)

  for (const tech of techs) {
    const pkg = tech.pubdev_package!
    try {
      const res = await fetch(`https://pub.dev/api/packages/${encodeURIComponent(pkg)}/score`)
      if (!res.ok) {
        errors.push(`pub.dev ${pkg}: ${res.status}`)
        continue
      }
      const data: PubDevScore = await res.json()
      if (data.likeCount != null) {
        dataPoints.push({
          technology_id: tech.id,
          source: 'pubdev',
          metric: 'likes',
          value: data.likeCount,
          metadata: { package: pkg },
          measured_at: TODAY,
        })
      }
      await sleep(100)
    } catch (err) {
      errors.push(`pub.dev ${pkg}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { source: 'pubdev', dataPoints, errors }
}

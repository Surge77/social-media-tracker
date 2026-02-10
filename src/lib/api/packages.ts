import type { Technology, FetcherResult, DataPoint } from '@/types'

/**
 * Fetch package download metrics for npm, PyPI, and crates.io
 * Returns data_points for: downloads
 */
export async function fetchPackageDownloads(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Fetch npm downloads
  const npmTechs = technologies.filter((t) => t.npm_package)
  for (const tech of npmTechs) {
    try {
      const downloads = await fetchNpmDownloads(tech.npm_package!)
      if (downloads !== null) {
        dataPoints.push({
          technology_id: tech.id,
          source: 'npm',
          metric: 'downloads',
          value: downloads,
          metadata: {},
          measured_at: today,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`npm/${tech.slug}: ${errorMsg}`)
    }
  }

  // Fetch PyPI downloads
  const pypiTechs = technologies.filter((t) => t.pypi_package)
  for (const tech of pypiTechs) {
    try {
      const downloads = await fetchPyPiDownloads(tech.pypi_package!)
      if (downloads !== null) {
        dataPoints.push({
          technology_id: tech.id,
          source: 'pypi',
          metric: 'downloads',
          value: downloads,
          metadata: {},
          measured_at: today,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`pypi/${tech.slug}: ${errorMsg}`)
    }
  }

  // Fetch crates.io downloads
  const cratesTechs = technologies.filter((t) => t.crates_package)
  for (const tech of cratesTechs) {
    try {
      const downloads = await fetchCratesDownloads(tech.crates_package!)
      if (downloads !== null) {
        dataPoints.push({
          technology_id: tech.id,
          source: 'crates',
          metric: 'downloads',
          value: downloads,
          metadata: {},
          measured_at: today,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`crates/${tech.slug}: ${errorMsg}`)
    }
  }

  return { source: 'npm', dataPoints, errors }
}

/**
 * Fetch npm weekly downloads
 * API: https://api.npmjs.org/downloads/point/last-week/{package}
 */
async function fetchNpmDownloads(packageName: string): Promise<number | null> {
  const url = `https://api.npmjs.org/downloads/point/last-week/${packageName}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      // Package not found or no download data
      return null
    }
    throw new Error(`npm API error ${response.status}`)
  }

  const data: NpmDownloadsResponse = await response.json()
  return data.downloads || 0
}

/**
 * Fetch PyPI weekly downloads
 * API: https://pypistats.org/api/packages/{package}/recent
 */
async function fetchPyPiDownloads(packageName: string): Promise<number | null> {
  const url = `https://pypistats.org/api/packages/${packageName}/recent`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      // Package not found
      return null
    }
    throw new Error(`PyPI API error ${response.status}`)
  }

  const data: PyPiDownloadsResponse = await response.json()
  return data.data?.last_week || 0
}

/**
 * Fetch crates.io downloads
 * API: https://crates.io/api/v1/crates/{crate}
 * Note: Returns total downloads, not weekly. We'll use recent_downloads if available.
 */
async function fetchCratesDownloads(crateName: string): Promise<number | null> {
  const url = `https://crates.io/api/v1/crates/${crateName}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'DevTrends/1.0 (https://devtrends.dev)',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      // Crate not found
      return null
    }
    if (response.status === 403) {
      throw new Error('Missing User-Agent header')
    }
    throw new Error(`crates.io API error ${response.status}`)
  }

  const data: CratesDownloadsResponse = await response.json()
  // Prefer recent_downloads if available, otherwise use total downloads
  return data.crate.recent_downloads || data.crate.downloads || 0
}

/**
 * API response types
 */
interface NpmDownloadsResponse {
  downloads: number
  start: string
  end: string
  package: string
}

interface PyPiDownloadsResponse {
  data: {
    last_day: number
    last_week: number
    last_month: number
  }
  package: string
  type: string
}

interface CratesDownloadsResponse {
  crate: {
    id: string
    name: string
    downloads: number
    recent_downloads?: number
    max_version: string
    description: string
  }
}

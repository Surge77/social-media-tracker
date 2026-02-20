import type { Technology, FetcherResult } from '@/types'

const NPMS_BULK_URL = 'https://api.npms.io/v2/package/mget'
const TODAY = new Date().toISOString().split('T')[0]

interface NpmsPackageScore {
  final: number
  detail: {
    quality: number
    popularity: number
    maintenance: number
  }
}

interface NpmsResponse {
  [packageName: string]: {
    analyzedAt?: string
    collected?: unknown
    evaluation?: unknown
    score?: NpmsPackageScore
    error?: { code: string; message: string }
  }
}

/**
 * Source 5: npms.io Package Scoring
 *
 * Bulk POST for up to 250 npm packages at once. No auth, no rate limit.
 * Returns quality/popularity/maintenance scores (0-1) per package.
 *
 * Scope: npm packages only (~50-60% of tracked technologies).
 * Scores stored in data_points (source: 'npms') and aggregated
 * into raw_sub_scores by the pipeline.
 */
export async function fetchNpmsData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const errors: string[] = []
  const dataPoints: FetcherResult['dataPoints'] = []

  // Only npm packages
  const npmTechs = technologies.filter((t) => t.npm_package)
  if (npmTechs.length === 0) {
    return { source: 'npms', dataPoints: [], errors: ['No npm packages found'] }
  }

  const packageNames = npmTechs.map((t) => t.npm_package!)
  const techByPackage = new Map<string, Technology>()
  for (const tech of npmTechs) {
    techByPackage.set(tech.npm_package!, tech)
  }

  // Process in chunks of 250 (API max)
  const CHUNK_SIZE = 250

  for (let i = 0; i < packageNames.length; i += CHUNK_SIZE) {
    const chunk = packageNames.slice(i, i + CHUNK_SIZE)

    try {
      const res = await fetch(NPMS_BULK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      })

      if (!res.ok) {
        errors.push(`npms.io bulk request failed: ${res.status}`)
        continue
      }

      const data: NpmsResponse = await res.json()

      for (const [packageName, result] of Object.entries(data)) {
        const tech = techByPackage.get(packageName)
        if (!tech) continue

        if (result.error) {
          errors.push(`${packageName}: ${result.error.message}`)
          continue
        }

        const score = result.score
        if (!score?.detail) continue

        const { quality, popularity, maintenance } = score.detail

        dataPoints.push(
          {
            technology_id: tech.id,
            source: 'npms',
            metric: 'quality_score',
            value: Math.round(quality * 1000) / 1000,
            metadata: { package: packageName },
            measured_at: TODAY,
          },
          {
            technology_id: tech.id,
            source: 'npms',
            metric: 'popularity_score',
            value: Math.round(popularity * 1000) / 1000,
            metadata: { package: packageName },
            measured_at: TODAY,
          },
          {
            technology_id: tech.id,
            source: 'npms',
            metric: 'maintenance_score',
            value: Math.round(maintenance * 1000) / 1000,
            metadata: { package: packageName },
            measured_at: TODAY,
          }
        )
      }
    } catch (err) {
      errors.push(`npms bulk chunk ${i}-${i + chunk.length}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `[npms.io] ${dataPoints.length} data points from ${npmTechs.length} packages, ${errors.length} errors`
  )

  return { source: 'npms', dataPoints, errors }
}

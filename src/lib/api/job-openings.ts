import type { Technology } from '@/types'
import {
  extractAdjacentSkills,
  getTechnologySearchTerms,
  inferRoleFromText,
  slugifyText,
} from '@/lib/jobs/taxonomy'
import {
  fetchHasDataJobsForTechnologies,
  fetchRemotiveFallbackListings,
  type JobListingSource,
  type NormalizedJobListing,
} from '@/lib/api/hasdata-jobs'

interface AggregatedListingsResult {
  listings: NormalizedJobListing[]
  errors: string[]
}

const DEFAULT_MARKETS = [
  { label: 'United States', adzunaCountry: 'us' },
  { label: 'India', adzunaCountry: 'in' },
  { label: 'United Kingdom', adzunaCountry: 'gb' },
]

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function normalizeLocation(rawLocation: string | null) {
  if (!rawLocation) {
    return {
      locationText: null,
      locationCountry: null,
      locationRegion: null,
      locationCity: null,
      isRemote: false,
    }
  }

  const cleaned = rawLocation.trim()
  const segments = cleaned.split(',').map((segment) => segment.trim()).filter(Boolean)
  const lower = cleaned.toLowerCase()

  return {
    locationText: cleaned,
    locationCountry: segments.length >= 1 ? segments[segments.length - 1] : null,
    locationRegion: segments.length >= 2 ? segments[segments.length - 2] : null,
    locationCity: segments.length >= 3 ? segments[0] : segments.length >= 2 ? segments[0] : null,
    isRemote: lower.includes('remote') || lower.includes('anywhere'),
  }
}

function matchTechnologySlugs(technologies: Technology[], text: string): string[] {
  const haystack = text.toLowerCase()
  return technologies
    .filter((technology) => getTechnologySearchTerms(technology).some((term) => haystack.includes(term.toLowerCase())))
    .map((technology) => technology.slug)
}

function buildQuery(technology: Technology): string {
  const primaryTerm = getTechnologySearchTerms(technology)[0] ?? technology.name
  return `${primaryTerm} developer`
}

function toNormalizedListing(
  source: JobListingSource,
  technologies: Technology[],
  item: {
    externalId: string
    title: string
    companyName: string | null
    jobUrl: string | null
    descriptionText: string | null
    locationRaw: string | null
    employmentType?: string | null
    seniority?: string | null
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string | null
    postedAt?: string | null
    metadata?: Record<string, unknown>
  }
): NormalizedJobListing | null {
  const title = item.title?.trim()
  if (!title) return null

  const location = normalizeLocation(item.locationRaw)
  const combinedText = `${title} ${item.descriptionText ?? ''} ${location.locationText ?? ''}`
  const matchedTechnologySlugs = matchTechnologySlugs(technologies, combinedText)
  if (matchedTechnologySlugs.length === 0) return null

  const role = inferRoleFromText(combinedText)
  return {
    source,
    externalId: item.externalId,
    canonicalHash: '',
    title,
    companyName: item.companyName,
    companySlug: slugifyText(item.companyName, item.externalId.toLowerCase()),
    jobUrl: item.jobUrl,
    descriptionText: item.descriptionText,
    locationText: location.locationText,
    locationCountry: location.locationCountry,
    locationRegion: location.locationRegion,
    locationCity: location.locationCity,
    isRemote: location.isRemote,
    employmentType: item.employmentType ?? null,
    seniority: item.seniority ?? null,
    roleSlug: role.slug,
    roleLabel: role.label,
    salaryMin: item.salaryMin ?? null,
    salaryMax: item.salaryMax ?? null,
    salaryCurrency: item.salaryCurrency ?? null,
    postedAt: item.postedAt ?? null,
    metadata: item.metadata ?? {},
    matchedTechnologySlugs,
    extractedSkills: extractAdjacentSkills(combinedText),
  }
}

async function fetchJSearchListings(technologies: Technology[]): Promise<NormalizedJobListing[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return []

  const settled = await Promise.allSettled(
    technologies.map(async (technology) => {
      const query = buildQuery(technology)
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      })
      if (!response.ok) throw new Error(`JSearch error ${response.status}`)
      const payload = (await response.json()) as Record<string, unknown>
      return asArray<Record<string, unknown>>(payload.data).map((job) => {
        const location = [asString(job.job_city), asString(job.job_state), asString(job.job_country)].filter(Boolean).join(', ')
        return toNormalizedListing('jsearch', technologies, {
          externalId: asString(job.job_id) ?? asString(job.job_apply_link) ?? query,
          title: asString(job.job_title) ?? '',
          companyName: asString(job.employer_name),
          jobUrl: asString(job.job_apply_link) ?? asString(job.job_offer_expiration_datetime_utc),
          descriptionText: asString(job.job_description),
          locationRaw: location || asString(job.job_location),
          employmentType: asString(job.job_employment_type),
          salaryMin: asNumber(job.job_min_salary),
          salaryMax: asNumber(job.job_max_salary),
          salaryCurrency: asString(job.job_salary_currency),
          postedAt: asString(job.job_posted_at_datetime_utc),
          metadata: job,
        })
      }).filter((job): job is NormalizedJobListing => Boolean(job))
    })
  )

  return settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
}

async function fetchAdzunaListings(technologies: Technology[], marketCount: number): Promise<NormalizedJobListing[]> {
  const appId = process.env.ADZUNA_APP_ID
  const apiKey = process.env.ADZUNA_API_KEY
  if (!appId || !apiKey) return []

  const markets = DEFAULT_MARKETS.slice(0, marketCount)
  const settled = await Promise.allSettled(
    technologies.flatMap((technology) =>
      markets.map(async (market) => {
        const url = `https://api.adzuna.com/v1/api/jobs/${market.adzunaCountry}/search/1?app_id=${appId}&app_key=${apiKey}&what=${encodeURIComponent(buildQuery(technology))}&results_per_page=12&content-type=application/json`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Adzuna error ${response.status}`)
        const payload = (await response.json()) as Record<string, unknown>
        return asArray<Record<string, unknown>>(payload.results).map((job) => {
          const company = asObject(job.company)
          const location = asObject(job.location)
          const salaryMax = asNumber(job.salary_max)
          const salaryMin = asNumber(job.salary_min)
          return toNormalizedListing('adzuna', technologies, {
            externalId: asString(job.id) ?? `${technology.slug}-${market.adzunaCountry}`,
            title: asString(job.title) ?? '',
            companyName: asString(company?.display_name),
            jobUrl: asString(job.redirect_url),
            descriptionText: asString(job.description),
            locationRaw: asString(location?.display_name) ?? market.label,
            employmentType: asString(job.contract_type),
            salaryMin,
            salaryMax,
            salaryCurrency: 'USD',
            postedAt: asString(job.created),
            metadata: job,
          })
        }).filter((job): job is NormalizedJobListing => Boolean(job))
      })
    )
  )

  return settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
}

async function fetchArbeitnowListings(technologies: Technology[]): Promise<NormalizedJobListing[]> {
  const response = await fetch('https://www.arbeitnow.com/api/job-board-api')
  if (!response.ok) throw new Error(`Arbeitnow error ${response.status}`)
  const payload = (await response.json()) as Record<string, unknown>
  return asArray<Record<string, unknown>>(payload.data).map((job) =>
    toNormalizedListing('arbeitnow', technologies, {
      externalId: asString(job.slug) ?? asString(job.url) ?? 'arbeitnow',
      title: asString(job.title) ?? '',
      companyName: asString(job.company_name),
      jobUrl: asString(job.url),
      descriptionText: asString(job.description),
      locationRaw: asString(job.location),
      employmentType: asString(job.job_types),
      postedAt: asString(job.created_at),
      metadata: job,
    })
  ).filter((job): job is NormalizedJobListing => Boolean(job))
}

export async function fetchAggregatedJobListings(
  technologies: Technology[],
  options?: {
    maxTechnologies?: number
    pagesPerTechnology?: number
    maxMarkets?: number
  }
): Promise<AggregatedListingsResult> {
  const selected = technologies.slice(0, options?.maxTechnologies ?? 20)
  const maxMarkets = Math.max(1, options?.maxMarkets ?? Number(process.env.JOBS_INTELLIGENCE_MAX_MARKETS ?? 3))
  const errors: string[] = []

  const hasDataListings = await Promise.allSettled(
    DEFAULT_MARKETS.slice(0, maxMarkets).map((market) =>
      fetchHasDataJobsForTechnologies(selected, {
        maxTechnologies: selected.length,
        pagesPerTechnology: options?.pagesPerTechnology ?? 1,
        location: market.label,
      })
    )
  )

  const jsearchRes = await Promise.allSettled([fetchJSearchListings(selected)])
  const adzunaRes = await Promise.allSettled([fetchAdzunaListings(selected, maxMarkets)])
  const remotiveRes = await Promise.allSettled([fetchRemotiveFallbackListings(selected)])
  const arbeitnowRes = await Promise.allSettled([fetchArbeitnowListings(selected)])

  const allSettled = [
    ...hasDataListings,
    ...jsearchRes,
    ...adzunaRes,
    ...remotiveRes,
    ...arbeitnowRes,
  ]

  const listings = allSettled.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value
    errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
    return []
  })

  return {
    listings,
    errors,
  }
}

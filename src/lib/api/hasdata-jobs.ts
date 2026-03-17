import { createHash } from 'node:crypto'
import type { Technology } from '@/types'
import {
  extractAdjacentSkills,
  getTechnologySearchTerms,
  inferRoleFromText,
  slugifyText,
} from '@/lib/jobs/taxonomy'

const HASDATA_BASE = 'https://api.hasdata.com/scrape'

export type JobListingSource =
  | 'hasdata_indeed'
  | 'jsearch'
  | 'adzuna'
  | 'remotive'
  | 'arbeitnow'
  | 'serpapi_google_jobs'

export interface NormalizedJobListing {
  source: JobListingSource
  externalId: string
  canonicalHash: string
  title: string
  companyName: string | null
  companySlug: string | null
  jobUrl: string | null
  descriptionText: string | null
  locationText: string | null
  locationCountry: string | null
  locationRegion: string | null
  locationCity: string | null
  isRemote: boolean
  employmentType: string | null
  seniority: string | null
  roleSlug: string
  roleLabel: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  postedAt: string | null
  metadata: Record<string, unknown>
  matchedTechnologySlugs: string[]
  extractedSkills: Array<{
    slug: string
    label: string
    category: string
    confidence: number
  }>
}

function getHasDataApiKey(): string {
  const key = process.env.HASDATA_API_KEY
  if (!key) {
    throw new Error('HASDATA_API_KEY is not configured')
  }
  return key
}

function buildCanonicalHash(parts: Array<string | null | undefined>): string {
  return createHash('sha1')
    .update(parts.filter(Boolean).join('||').toLowerCase())
    .digest('hex')
}

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

function normalizeListing(
  item: Record<string, unknown>,
  technologies: Technology[]
): NormalizedJobListing | null {
  const title = asString(item.title) ?? asString(item.job_title) ?? asString(item.position)
  if (!title) return null

  const companyName =
    asString(item.company_name) ??
    asString(asObject(item.company)?.name) ??
    asString(item.company)
  const jobUrl = asString(item.job_url) ?? asString(item.url) ?? asString(item.apply_url)
  const externalId = asString(item.job_id) ?? asString(item.id) ?? jobUrl ?? title
  const descriptionText = asString(item.description) ?? asString(item.summary)
  const locationRaw =
    asString(item.location) ??
    asString(asObject(item.location)?.full_address) ??
    asString(asObject(item.location)?.display_name) ??
    asString(item.location_text)
  const salaryMin =
    asNumber(item.salary_min) ??
    asNumber(asObject(item.salary)?.min_amount)
  const salaryMax =
    asNumber(item.salary_max) ??
    asNumber(asObject(item.salary)?.max_amount)
  const salaryCurrency =
    asString(item.salary_currency) ??
    asString(asObject(item.salary)?.currency)
  const employmentType =
    asString(item.employment_type) ??
    asString(item.job_type)
  const seniority =
    asString(item.seniority) ??
    asString(item.experience_level)
  const postedAt =
    asString(item.posted_at) ??
    asString(item.date_posted) ??
    asString(item.posted_time)

  const { locationText, locationCountry, locationRegion, locationCity, isRemote } = normalizeLocation(locationRaw)
  const role = inferRoleFromText(`${title} ${descriptionText ?? ''}`)

  const technologyMatches = technologies
    .filter((technology) => {
      const haystack = `${title} ${descriptionText ?? ''} ${locationText ?? ''}`.toLowerCase()
      return getTechnologySearchTerms(technology)
        .some((term) => haystack.includes(term.toLowerCase()))
    })
    .map((technology) => technology.slug)

  const extractedSkills = extractAdjacentSkills(`${title} ${descriptionText ?? ''}`)

  return {
    source: 'hasdata_indeed',
    externalId,
    canonicalHash: buildCanonicalHash([title, companyName, locationText, jobUrl]),
    title,
    companyName,
    companySlug: slugifyText(companyName, externalId.toLowerCase()),
    jobUrl,
    descriptionText,
    locationText,
    locationCountry,
    locationRegion,
    locationCity,
    isRemote,
    employmentType,
    seniority,
    roleSlug: role.slug,
    roleLabel: role.label,
    salaryMin,
    salaryMax,
    salaryCurrency,
    postedAt,
    metadata: item,
    matchedTechnologySlugs: technologyMatches,
    extractedSkills,
  }
}

export async function fetchHasDataIndeedListings(
  technologies: Technology[],
  options: {
    query: string
    location?: string
    page?: number
    limit?: number
  }
): Promise<NormalizedJobListing[]> {
  const apiKey = getHasDataApiKey()
  const url = new URL(`${HASDATA_BASE}/indeed/listing`)
  url.searchParams.set('keyword', options.query)
  url.searchParams.set('location', options.location ?? 'United States')
  url.searchParams.set('domain', 'www.indeed.com')
  if (options.page != null) url.searchParams.set('start', String(options.page * 10))
  if (options.limit != null) url.searchParams.set('limit', String(options.limit))

  const response = await fetch(url.toString(), {
    headers: {
      'x-api-key': apiKey,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HasData Indeed listing API error ${response.status}`)
  }

  const payload = (await response.json()) as Record<string, unknown>
  const items = asArray<Record<string, unknown>>(
    payload.jobs ?? payload.results ?? payload.data ?? payload.organic_results
  )

  return items
    .map((item) => normalizeListing(item, technologies))
    .filter((item): item is NormalizedJobListing => item !== null)
}

export async function fetchHasDataJobsForTechnologies(
  technologies: Technology[],
  options?: {
    maxTechnologies?: number
    pagesPerTechnology?: number
    location?: string
  }
): Promise<NormalizedJobListing[]> {
  const maxTechnologies = options?.maxTechnologies ?? 20
  const pagesPerTechnology = options?.pagesPerTechnology ?? 1
  const selected = technologies.slice(0, maxTechnologies)
  const listings: NormalizedJobListing[] = []

  for (const technology of selected) {
    const primaryTerm = getTechnologySearchTerms(technology)[0] ?? technology.name
    for (let page = 0; page < pagesPerTechnology; page += 1) {
      const results = await fetchHasDataIndeedListings(technologies, {
        query: `${primaryTerm} developer`,
        location: options?.location ?? 'United States',
        page,
        limit: 25,
      })
      listings.push(...results)
    }
  }

  return listings
}

interface RemotiveJobResponse {
  jobs?: Array<{
    id?: number
    title?: string
    company_name?: string
    candidate_required_location?: string
    category?: string
    url?: string
    publication_date?: string
    description?: string
    job_type?: string
    salary?: string
  }>
}

export async function fetchRemotiveFallbackListings(
  technologies: Technology[]
): Promise<NormalizedJobListing[]> {
  const response = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=250')
  if (!response.ok) {
    throw new Error(`Remotive API error ${response.status}`)
  }

  const payload = (await response.json()) as RemotiveJobResponse
  const jobs: NonNullable<RemotiveJobResponse['jobs']> = payload.jobs ?? []
  const listings = jobs.map<NormalizedJobListing | null>((job) => {
      const title = job.title?.trim()
      if (!title) return null
      const descriptionText = job.description ?? null
      const location = job.candidate_required_location ?? 'Remote'
      const locationInfo = normalizeLocation(location)
      const role = inferRoleFromText(`${title} ${descriptionText ?? ''}`)
      const matchedTechnologySlugs = technologies
        .filter((technology) => {
          const haystack = `${title} ${descriptionText ?? ''}`.toLowerCase()
          return getTechnologySearchTerms(technology)
            .some((term) => haystack.includes(term.toLowerCase()))
        })
        .map((technology) => technology.slug)

      if (matchedTechnologySlugs.length === 0) return null

      return {
        source: 'remotive',
        externalId: String(job.id ?? job.url ?? title),
        canonicalHash: buildCanonicalHash([title, job.company_name, location, job.url]),
        title,
        companyName: job.company_name ?? null,
        companySlug: slugifyText(job.company_name, 'unknown-company'),
        jobUrl: job.url ?? null,
        descriptionText,
        locationText: locationInfo.locationText,
        locationCountry: locationInfo.locationCountry,
        locationRegion: locationInfo.locationRegion,
        locationCity: locationInfo.locationCity,
        isRemote: true,
        employmentType: job.job_type ?? null,
        seniority: null,
        roleSlug: role.slug,
        roleLabel: role.label,
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
        postedAt: job.publication_date ?? null,
        metadata: {
          category: job.category ?? null,
          salary: job.salary ?? null,
          fallbackSource: 'remotive',
        },
        matchedTechnologySlugs,
        extractedSkills: extractAdjacentSkills(`${title} ${descriptionText ?? ''}`),
      } satisfies NormalizedJobListing
    })

  return listings.filter((listing): listing is NormalizedJobListing => listing !== null)
}

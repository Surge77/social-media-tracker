import type { Technology } from '@/types'
import { getTechnologySearchTerms } from '@/lib/jobs/taxonomy'

const SERPAPI_BASE = 'https://serpapi.com/search.json'

export interface GoogleTrendsSignal {
  searchInterest: number | null
  searchVelocity: number
  searchAcceleration: number
  geoSpread: number
  relatedQueriesRisingCount: number
  raw: Record<string, unknown>
}

export interface GoogleJobsConfirmation {
  totalResults: number
  companyNames: string[]
  locationLabels: string[]
  raw: Record<string, unknown>
}

function getSerpApiKey(): string {
  const key = process.env.SERPAPI_API_KEY
  if (!key) {
    throw new Error('SERPAPI_API_KEY is not configured')
  }
  return key
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function computeVelocity(values: number[]): number {
  if (values.length < 2) return 0
  const tail = values.slice(-4)
  const head = values.slice(-8, -4)
  return average(tail) - average(head.length > 0 ? head : values.slice(0, 4))
}

function computeAcceleration(values: number[]): number {
  if (values.length < 3) return 0
  const firstVelocity = computeVelocity(values.slice(0, Math.max(4, values.length - 2)))
  const secondVelocity = computeVelocity(values)
  return secondVelocity - firstVelocity
}

export async function fetchGoogleTrendsSignal(term: string): Promise<GoogleTrendsSignal> {
  const apiKey = getSerpApiKey()
  const url = new URL(SERPAPI_BASE)
  url.searchParams.set('engine', 'google_trends')
  url.searchParams.set('q', term)
  url.searchParams.set('data_type', 'TIMESERIES')
  url.searchParams.set('date', 'today 3-m')
  url.searchParams.set('geo', 'US')
  url.searchParams.set('api_key', apiKey)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`SerpApi Google Trends error ${response.status}`)
  }

  const payload = (await response.json()) as Record<string, unknown>
  const interestOverTime = asObject(payload.interest_over_time)
  const relatedQueriesObject = asObject(payload.related_queries)
  const timeline = asArray<Record<string, unknown>>(
    interestOverTime?.timeline_data ??
    payload.interest_over_time ??
    payload.timeline_data
  )

  const values = timeline
    .map((row) => {
      const valuesArray = asArray<unknown>(row.values)
      const extracted =
        asNumber(valuesArray[0]) ??
        asNumber(row.extracted_value) ??
        asNumber(row.value)
      return extracted ?? 0
    })
    .filter((value) => Number.isFinite(value))

  const comparedBreakdown = asArray<Record<string, unknown>>(
    payload.interest_by_region ??
    payload.compared_breakdown_by_region
  )

  const geoSpread = comparedBreakdown.filter((row) => asNumber(row.value ?? row.extracted_value) != null).length

  const relatedQueries = asArray<Record<string, unknown>>(
    relatedQueriesObject?.rising ??
    payload.related_queries_rising
  )

  return {
    searchInterest: values.length > 0 ? values[values.length - 1] : null,
    searchVelocity: computeVelocity(values),
    searchAcceleration: computeAcceleration(values),
    geoSpread,
    relatedQueriesRisingCount: relatedQueries.length,
    raw: payload,
  }
}

export async function fetchTechnologyGoogleTrendsSignal(
  technology: Technology
): Promise<GoogleTrendsSignal> {
  const term = getTechnologySearchTerms(technology)[0] ?? technology.name
  return fetchGoogleTrendsSignal(term)
}

export async function fetchGoogleJobsConfirmation(query: string): Promise<GoogleJobsConfirmation> {
  const apiKey = getSerpApiKey()
  const url = new URL(SERPAPI_BASE)
  url.searchParams.set('engine', 'google_jobs')
  url.searchParams.set('q', query)
  url.searchParams.set('hl', 'en')
  url.searchParams.set('api_key', apiKey)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`SerpApi Google Jobs error ${response.status}`)
  }

  const payload = (await response.json()) as Record<string, unknown>
  const jobsResults = asArray<Record<string, unknown>>(payload.jobs_results ?? payload.jobs ?? [])
  const companyNames = jobsResults
    .map((job) => {
      const company = asObject(job.company_name) ?? asObject(job.company)
      return typeof job.company_name === 'string'
        ? job.company_name
        : typeof company?.name === 'string'
          ? company.name
          : null
    })
    .filter((name): name is string => Boolean(name))
  const locationLabels = jobsResults
    .map((job) => {
      const location = asObject(job.location)
      return typeof job.location === 'string'
        ? job.location
        : typeof location?.name === 'string'
          ? location.name
          : null
    })
    .filter((label): label is string => Boolean(label))

  return {
    totalResults: jobsResults.length,
    companyNames: Array.from(new Set(companyNames)),
    locationLabels: Array.from(new Set(locationLabels)),
    raw: payload,
  }
}

import type { Technology, FetcherResult, DataPoint } from '@/types'

/**
 * Fetch job market data from multiple sources.
 * Uses broad category queries to conserve API limits.
 * Returns data_points for: job_postings (count)
 */
export async function fetchJobsData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Fetch from all job sources
  const allJobs: Array<{ title: string; description: string }> = []

  // Remotive (public API, no auth)
  let remotiveJobs: Array<{ title: string; description: string }> = []
  try {
    remotiveJobs = await fetchRemotiveJobs()
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    errors.push(`Remotive: ${errorMsg}`)
  }

  // Adzuna (requires credentials)
  let adzunaJobs: Array<{ title: string; description: string }> = []
  const adzunaAppId = process.env.ADZUNA_APP_ID
  const adzunaApiKey = process.env.ADZUNA_API_KEY
  if (adzunaAppId && adzunaApiKey) {
    try {
      adzunaJobs = await fetchAdzunaJobs(adzunaAppId, adzunaApiKey)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`Adzuna: ${errorMsg}`)
    }
  } else {
    errors.push('Adzuna: ADZUNA_APP_ID or ADZUNA_API_KEY not configured')
  }

  // JSearch (RapidAPI, requires key)
  let jsearchJobs: Array<{ title: string; description: string }> = []
  const rapidApiKey = process.env.RAPIDAPI_KEY
  if (rapidApiKey) {
    try {
      jsearchJobs = await fetchJSearchJobs(rapidApiKey)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`JSearch: ${errorMsg}`)
    }
  } else {
    errors.push('JSearch: RAPIDAPI_KEY not configured')
  }

  // Count job mentions per source separately so the pipeline can z-score them independently
  for (const tech of technologies) {
    if (adzunaJobs.length > 0) {
      dataPoints.push({
        technology_id: tech.id,
        source: 'adzuna',
        metric: 'job_postings',
        value: countTechnologyMentions(tech, adzunaJobs),
        metadata: {},
        measured_at: today,
      })
    }

    if (jsearchJobs.length > 0) {
      dataPoints.push({
        technology_id: tech.id,
        source: 'jsearch',
        metric: 'job_postings',
        value: countTechnologyMentions(tech, jsearchJobs),
        metadata: {},
        measured_at: today,
      })
    }

    if (remotiveJobs.length > 0) {
      dataPoints.push({
        technology_id: tech.id,
        source: 'remotive',
        metric: 'job_postings',
        value: countTechnologyMentions(tech, remotiveJobs),
        metadata: {},
        measured_at: today,
      })
    }
  }

  return { source: 'jobs', dataPoints, errors }
}

/**
 * Fetch jobs from Remotive (public API, no auth)
 */
async function fetchRemotiveJobs(): Promise<Array<{ title: string; description: string }>> {
  const url = 'https://remotive.com/api/remote-jobs?category=software-dev&limit=100'

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Remotive API error ${response.status}`)
  }

  const data: RemotiveResponse = await response.json()
  return data.jobs.map((job) => ({
    title: job.title,
    description: job.description || '',
  }))
}

/**
 * Fetch jobs from Adzuna using broad category queries
 */
async function fetchAdzunaJobs(
  appId: string,
  apiKey: string
): Promise<Array<{ title: string; description: string }>> {
  const queries = [
    'react OR vue OR angular OR svelte frontend developer',
    'python OR django OR fastapi backend developer',
    'rust OR go OR java backend developer',
    'devops kubernetes docker terraform',
    'machine learning tensorflow pytorch',
  ]

  const allJobs: Array<{ title: string; description: string }> = []

  for (const query of queries) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&what=${encodeURIComponent(
        query
      )}&content-type=application/json`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Adzuna API error ${response.status} for query: ${query}`)
      }

      const data: AdzunaResponse = await response.json()
      allJobs.push(
        ...data.results.map((job) => ({
          title: job.title,
          description: job.description,
        }))
      )
    } catch (error) {
      // Continue with other queries even if one fails
      continue
    }
  }

  return allJobs
}

/**
 * Fetch jobs from JSearch (RapidAPI) using broad category queries
 */
async function fetchJSearchJobs(
  rapidApiKey: string
): Promise<Array<{ title: string; description: string }>> {
  const queries = [
    'react vue angular frontend developer',
    'python django fastapi developer',
    'rust go java developer',
    'devops kubernetes docker',
    'machine learning AI developer',
  ]

  const allJobs: Array<{ title: string; description: string }> = []

  for (const query of queries) {
    try {
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        query
      )}&num_pages=1`

      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      })

      if (!response.ok) {
        throw new Error(`JSearch API error ${response.status} for query: ${query}`)
      }

      const data: JSearchResponse = await response.json()
      allJobs.push(
        ...(data.data || []).map((job) => ({
          title: job.job_title,
          description: job.job_description || '',
        }))
      )
    } catch (error) {
      // Continue with other queries even if one fails
      continue
    }
  }

  return allJobs
}

/**
 * Count how many jobs mention a specific technology
 */
function countTechnologyMentions(
  tech: Technology,
  jobs: Array<{ title: string; description: string }>
): number {
  let count = 0
  // Use word-boundary patterns to avoid false positives
  // e.g. "Go" should not match "Google", "good", "Django"
  const patterns = [tech.name, ...tech.aliases].map((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`, 'i')
  })

  for (const job of jobs) {
    const text = `${job.title} ${job.description}`
    const mentioned = patterns.some((pattern) => pattern.test(text))
    if (mentioned) count++
  }

  return count
}

/**
 * API response types
 */
interface RemotiveResponse {
  jobs: Array<{
    id: number
    title: string
    description: string
    company_name: string
    url: string
  }>
}

interface AdzunaResponse {
  results: Array<{
    id: string
    title: string
    description: string
    company: {
      display_name: string
    }
  }>
  count: number
}

interface JSearchResponse {
  status: string
  data: Array<{
    job_id: string
    job_title: string
    job_description: string
    employer_name: string
  }>
}

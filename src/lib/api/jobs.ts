import type { Technology, FetcherResult, DataPoint } from '@/types'

const DELAY_MS = 200 // Polite delay between API calls

/**
 * Fetch job market data from multiple sources.
 *
 * Strategy:
 * - Adzuna: per-technology search → uses the `count` field from the response
 *   (total matching jobs) rather than downloading bulk results and counting.
 * - JSearch (RapidAPI): per-technology search → estimated_total_results.
 * - Remotive: bulk fetch + improved mention counting (free API, no limits).
 *
 * This produces meaningful, non-zero counts for popular technologies.
 */
export async function fetchJobsData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0]

  // ─── Source 1: Remotive (public API, no auth, bulk + mention count) ───
  let remotiveJobs: Array<{ title: string; description: string }> = []
  try {
    remotiveJobs = await fetchRemotiveJobs()
    console.log(`[Jobs] Remotive: fetched ${remotiveJobs.length} jobs`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    errors.push(`Remotive: ${errorMsg}`)
  }

  // ─── Source 2: Adzuna (per-technology count query) ───
  const adzunaAppId = process.env.ADZUNA_APP_ID
  const adzunaApiKey = process.env.ADZUNA_API_KEY
  const hasAdzuna = !!(adzunaAppId && adzunaApiKey)
  if (!hasAdzuna) {
    errors.push('Adzuna: ADZUNA_APP_ID or ADZUNA_API_KEY not configured')
  }

  // ─── Source 3: JSearch (per-technology count query) ───
  const rapidApiKey = process.env.RAPIDAPI_KEY
  const hasJSearch = !!rapidApiKey
  if (!hasJSearch) {
    errors.push('JSearch: RAPIDAPI_KEY not configured')
  }

  // ─── Process each technology ───
  for (const tech of technologies) {
    // Remotive: mention count from bulk data
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

    // Adzuna: direct count query per technology
    if (hasAdzuna) {
      try {
        const count = await fetchAdzunaCountForTech(tech, adzunaAppId!, adzunaApiKey!)
        dataPoints.push({
          technology_id: tech.id,
          source: 'adzuna',
          metric: 'job_postings',
          value: count,
          metadata: {},
          measured_at: today,
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        errors.push(`Adzuna [${tech.slug}]: ${errorMsg}`)
        // Still push 0 so the scoring pipeline has a data point
        dataPoints.push({
          technology_id: tech.id,
          source: 'adzuna',
          metric: 'job_postings',
          value: 0,
          metadata: { error: true },
          measured_at: today,
        })
      }
      await sleep(DELAY_MS)
    }

    // JSearch: direct count query per technology
    if (hasJSearch) {
      try {
        const count = await fetchJSearchCountForTech(tech, rapidApiKey!)
        dataPoints.push({
          technology_id: tech.id,
          source: 'jsearch',
          metric: 'job_postings',
          value: count,
          metadata: {},
          measured_at: today,
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        errors.push(`JSearch [${tech.slug}]: ${errorMsg}`)
        dataPoints.push({
          technology_id: tech.id,
          source: 'jsearch',
          metric: 'job_postings',
          value: 0,
          metadata: { error: true },
          measured_at: today,
        })
      }
      await sleep(DELAY_MS)
    }
  }

  console.log(`[Jobs] Generated ${dataPoints.length} data points for ${technologies.length} technologies`)
  if (errors.length > 0) console.log(`[Jobs] Errors: ${errors.length}`)

  return { source: 'jobs', dataPoints, errors }
}

// ────────────────────────────────────────────────────────────────
// Per-technology query helpers
// ────────────────────────────────────────────────────────────────

/**
 * Build the best search query term for a technology.
 * Some tech names are too short/ambiguous for job searches,
 * so we use aliases or add context.
 */
function getJobSearchTerm(tech: Technology): string {
  const name = tech.name
  const lower = name.toLowerCase()

  // Technologies with ambiguous single-word names
  const overrides: Record<string, string> = {
    'go': 'golang developer',
    'c': '"C programming" developer',
    'r': '"R programming" developer',
    'rust': 'rust developer',
    'swift': 'swift ios developer',
    'dart': 'dart flutter developer',
    'ruby': 'ruby developer',
    'next.js': 'nextjs developer',
    'nuxt': 'nuxtjs developer',
    'vue': 'vuejs developer',
    'deno': 'deno developer',
    'bun': 'bun javascript developer',
    'express': 'express.js developer',
    'flask': 'flask python developer',
    'gin': 'gin golang developer',
    'echo': 'echo golang developer',
    'fiber': 'fiber golang developer',
  }

  if (overrides[lower]) return overrides[lower]

  // For most technologies, "name developer" is a good query
  // Use the longest alias if it's more descriptive
  const longestAlias = tech.aliases
    .filter(a => a.length > name.length)
    .sort((a, b) => b.length - a.length)[0]

  const term = longestAlias ?? name
  return `${term} developer`
}

/**
 * Fetch job COUNT from Adzuna for a single technology.
 * Uses the `count` field in the search response (total matching jobs),
 * NOT the number of results returned on the page.
 */
async function fetchAdzunaCountForTech(
  tech: Technology,
  appId: string,
  apiKey: string
): Promise<number> {
  const query = getJobSearchTerm(tech)
  // results_per_page=1 minimizes response size — we only need the `count` field
  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&what=${encodeURIComponent(
    query
  )}&results_per_page=1&content-type=application/json`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limited')
    }
    throw new Error(`API error ${response.status}`)
  }

  const data: AdzunaResponse = await response.json()
  return data.count ?? 0
}

/**
 * Fetch job count from JSearch (RapidAPI) for a single technology.
 * Uses estimated_total_results when available, falls back to data.length × num_pages.
 */
async function fetchJSearchCountForTech(
  tech: Technology,
  rapidApiKey: string
): Promise<number> {
  const query = getJobSearchTerm(tech)
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
    if (response.status === 429) {
      throw new Error('Rate limited')
    }
    throw new Error(`API error ${response.status}`)
  }

  const data: JSearchResponse = await response.json()

  // JSearch returns estimated_total_results showing total matching jobs
  if (data.estimated_total_results && data.estimated_total_results > 0) {
    return data.estimated_total_results
  }

  // Fallback: count returned results × estimated pages
  const resultsCount = data.data?.length ?? 0
  const numPages = data.num_pages ?? 1
  return resultsCount * Math.max(numPages, 1)
}

// ────────────────────────────────────────────────────────────────
// Remotive: bulk fetch + improved mention counting
// ────────────────────────────────────────────────────────────────

/**
 * Fetch jobs from Remotive (public API, no auth).
 * Increased limit to 250 for better coverage.
 */
async function fetchRemotiveJobs(): Promise<Array<{ title: string; description: string }>> {
  const url = 'https://remotive.com/api/remote-jobs?category=software-dev&limit=250'

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Remotive API error ${response.status}`)
  }

  const data: RemotiveResponse = await response.json()
  return (data.jobs ?? []).map((job) => ({
    title: job.title ?? '',
    description: job.description ?? '',
  }))
}

/**
 * Count how many jobs mention a specific technology.
 * Improved to handle special characters in tech names (C++, C#, Node.js).
 */
function countTechnologyMentions(
  tech: Technology,
  jobs: Array<{ title: string; description: string }>
): number {
  let count = 0

  // Build patterns for each term (name + aliases)
  const terms = [tech.name, ...tech.aliases]
  const patterns = terms.map((term) => buildMentionPattern(term))

  for (const job of jobs) {
    const text = `${job.title} ${job.description}`.toLowerCase()
    const mentioned = patterns.some((pattern) => pattern.test(text))
    if (mentioned) count++
  }

  return count
}

/**
 * Build a regex pattern that handles special tech names gracefully.
 *
 * Standard \b word boundaries break for names containing non-word
 * characters like +, #, . (e.g., "C++", "C#", "Node.js").
 * We use look-behind/look-ahead alternatives for these cases.
 */
function buildMentionPattern(term: string): RegExp {
  const lower = term.toLowerCase()

  // Special cases that need exact patterns
  const specialPatterns: Record<string, string> = {
    'c++': 'c\\+\\+',
    'c#': 'c#|c\\s*sharp|csharp',
    'c': '(?<![a-z])c(?![a-z+#])',
    'r': '(?<![a-z])r(?![a-z])',
    'go': '(?:^|\\s|,)go(?:lang)?(?:\\s|,|$|\\.)',
    'node.js': 'node\\.?js|node\\.js',
    '.net': '\\.net|dotnet',
    'f#': 'f#|f\\s*sharp|fsharp',
  }

  if (specialPatterns[lower]) {
    return new RegExp(specialPatterns[lower], 'i')
  }

  // Default: escape special chars and use word boundaries
  const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i')
}

// ────────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ────────────────────────────────────────────────────────────────
// API response types
// ────────────────────────────────────────────────────────────────

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
  estimated_total_results?: number
  num_pages?: number
}

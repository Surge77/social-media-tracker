import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  JobCompanySummary,
  JobMarketHighlight,
  JobOpeningRecord,
  JobsCompaniesResponse,
  JobsOpeningsResponse,
} from '@/types'
import {
  getOpeningConfidenceScore,
  getOpeningRecommendationScore,
  getOpeningWhyThisMatters,
} from '@/lib/jobs/openings'
import { slugifyText } from '@/lib/jobs/taxonomy'

export interface JobOpeningsFilters {
  technology?: string
  company?: string
  location?: string
  remote?: 'all' | 'remote' | 'onsite'
  role?: string
  seniority?: string
  source?: string
  postedWithin?: '24h' | '72h' | '7d' | '30d'
  page?: number
  pageSize?: number
}

type TechRow = {
  id: string
  slug: string
  name: string
  color: string | null
}

type ListingRow = {
  id: string
  canonical_hash: string
  title: string
  company_name: string | null
  company_slug: string | null
  job_url: string | null
  description_text: string | null
  location_text: string | null
  location_country: string | null
  location_region: string | null
  location_city: string | null
  is_remote: boolean
  employment_type: string | null
  seniority: string | null
  role_slug: string | null
  role_label: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  posted_at: string | null
  source: string
  metadata?: Record<string, unknown> | null
  updated_at?: string | null
}

type SightingRow = {
  job_listing_id: string
  source: string
}

type TechLinkRow = {
  job_listing_id: string
  technology_id: string
}

type SkillRow = {
  job_listing_id: string
  skill_slug: string
  skill_label: string
}

const SOURCE_LABELS: Record<string, string> = {
  hasdata_indeed: 'Indeed',
  jsearch: 'JSearch',
  adzuna: 'Adzuna',
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
  serpapi_google_jobs: 'Google Jobs',
}

function toDateFloor(period: NonNullable<JobOpeningsFilters['postedWithin']>): string {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const map = {
    '24h': 24 * hour,
    '72h': 72 * hour,
    '7d': 7 * 24 * hour,
    '30d': 30 * 24 * hour,
  }
  return new Date(now - map[period]).toISOString()
}

async function getTechLookup(supabase: SupabaseClient): Promise<Map<string, TechRow>> {
  const { data, error } = await supabase
    .from('technologies')
    .select('id, slug, name, color')
    .eq('is_active', true)

  if (error) throw new Error(`Failed to fetch technologies: ${error.message}`)
  return new Map((data ?? []).map((row) => [row.id as string, row as TechRow]))
}

async function getTechnologyIdBySlug(supabase: SupabaseClient, slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('technologies')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`Failed to resolve technology: ${error.message}`)
  return (data?.id as string | undefined) ?? null
}

async function getLatestListingsTimestamp(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase
    .from('job_listings')
    .select('updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch jobs freshness: ${error.message}`)
  return (data?.updated_at as string | undefined) ?? null
}

function isMissingTableError(message: string | undefined): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return lower.includes('could not find the table') || lower.includes('does not exist')
}

function matchesLocationFilter(row: ListingRow, locationSlug?: string): boolean {
  if (!locationSlug) return true
  const candidates = [
    row.location_city,
    row.location_region,
    row.location_country,
    row.location_text,
    row.is_remote ? 'remote' : null,
  ]
  return candidates.some((candidate) => candidate && slugifyText(candidate).includes(locationSlug))
}

function matchesSourceFilter(sources: string[], source?: string): boolean {
  if (!source) return true
  return sources.includes(source)
}

function getMetadataSources(metadata: Record<string, unknown> | null | undefined): string[] {
  const value = metadata?.sources
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

function buildHighlights(openings: JobOpeningRecord[], companies: JobCompanySummary[]): JobMarketHighlight[] {
  if (openings.length === 0) return []

  const freshest = openings[0]
  const remoteLeaders = openings.filter((opening) => opening.isRemote).length
  const salaryVisible = openings.filter((opening) => opening.salaryMin != null || opening.salaryMax != null).length
  const topCompany = companies[0]

  return [
    {
      title: 'Best bet now',
      body: `${freshest.title} at ${freshest.companyName ?? 'an active employer'} ranks highest on freshness, source confidence, and listing completeness.`,
      tone: 'positive',
    },
    {
      title: 'Remote opportunity mix',
      body: `${remoteLeaders} of the top ${openings.length} openings are remote-friendly, keeping the page grounded in real distributed hiring rather than only local demand.`,
      tone: 'neutral',
    },
    {
      title: 'Hiring concentration',
      body: topCompany
        ? `${topCompany.companyName} is the most active employer in the current slice with ${topCompany.activeOpenings} live openings across ${topCompany.topTechnologies.length} stack clusters.`
        : `${salaryVisible} openings include salary data, which helps separate high-signal roles from thin aggregator noise.`,
      tone: 'neutral',
    },
  ]
}

export async function getJobsOpenings(
  supabase: SupabaseClient,
  filters: JobOpeningsFilters = {}
): Promise<JobsOpeningsResponse> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 24))
  const techLookup = await getTechLookup(supabase)

  let technologyListingIds: string[] | null = null
  if (filters.technology) {
    const technologyId = await getTechnologyIdBySlug(supabase, filters.technology)
    if (!technologyId) {
      return {
        openings: [],
        highlights: [],
        total: 0,
        page,
        pageSize,
        lastUpdated: await getLatestListingsTimestamp(supabase),
      }
    }

    const { data: links, error: linksError } = await supabase
      .from('job_listing_technologies')
      .select('job_listing_id')
      .eq('technology_id', technologyId)

    if (linksError) throw new Error(`Failed to fetch technology-linked jobs: ${linksError.message}`)
    technologyListingIds = Array.from(new Set((links ?? []).map((row) => row.job_listing_id as string)))
    if (technologyListingIds.length === 0) {
      return {
        openings: [],
        highlights: [],
        total: 0,
        page,
        pageSize,
        lastUpdated: await getLatestListingsTimestamp(supabase),
      }
    }
  }

  let query = supabase
    .from('job_listings')
    .select('id, canonical_hash, title, company_name, company_slug, job_url, description_text, location_text, location_country, location_region, location_city, is_remote, employment_type, seniority, role_slug, role_label, salary_min, salary_max, salary_currency, posted_at, source, metadata, updated_at')
    .eq('is_active', true)

  if (technologyListingIds) query = query.in('id', technologyListingIds)
  if (filters.company) query = query.eq('company_slug', filters.company)
  if (filters.role) query = query.eq('role_slug', filters.role)
  if (filters.seniority) query = query.ilike('seniority', `%${filters.seniority}%`)
  if (filters.remote === 'remote') query = query.eq('is_remote', true)
  if (filters.remote === 'onsite') query = query.eq('is_remote', false)
  if (filters.postedWithin) query = query.gte('posted_at', toDateFloor(filters.postedWithin))

  const fetchSize = Math.max(pageSize * 4, 80)
  const { data, error } = await query
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(fetchSize)

  if (error) throw new Error(`Failed to fetch job openings: ${error.message}`)

  const rows = ((data ?? []) as ListingRow[]).filter((row) => matchesLocationFilter(row, filters.location))
  const ids = rows.map((row) => row.id)

  const [sightingsRes, techLinksRes, skillsRes, lastUpdated] = await Promise.all([
    ids.length > 0
      ? supabase.from('job_listing_sightings').select('job_listing_id, source').in('job_listing_id', ids)
      : Promise.resolve({ data: [], error: null }),
    ids.length > 0
      ? supabase.from('job_listing_technologies').select('job_listing_id, technology_id').in('job_listing_id', ids)
      : Promise.resolve({ data: [], error: null }),
    ids.length > 0
      ? supabase.from('job_listing_skills').select('job_listing_id, skill_slug, skill_label').in('job_listing_id', ids)
      : Promise.resolve({ data: [], error: null }),
    getLatestListingsTimestamp(supabase),
  ])

  const canUseSightings = !sightingsRes.error || isMissingTableError(sightingsRes.error.message)
  if (sightingsRes.error && !isMissingTableError(sightingsRes.error.message)) {
    throw new Error(`Failed to fetch job sightings: ${sightingsRes.error.message}`)
  }
  if (techLinksRes.error) throw new Error(`Failed to fetch opening technologies: ${techLinksRes.error.message}`)
  if (skillsRes.error) throw new Error(`Failed to fetch opening skills: ${skillsRes.error.message}`)

  const sightingsByListing = new Map<string, string[]>()
  if (canUseSightings) {
    for (const row of (sightingsRes.data ?? []) as SightingRow[]) {
      const bucket = sightingsByListing.get(row.job_listing_id) ?? []
      bucket.push(row.source)
      sightingsByListing.set(row.job_listing_id, bucket)
    }
  }

  const techsByListing = new Map<string, TechRow[]>()
  for (const row of (techLinksRes.data ?? []) as TechLinkRow[]) {
    const technology = techLookup.get(row.technology_id)
    if (!technology) continue
    const bucket = techsByListing.get(row.job_listing_id) ?? []
    bucket.push(technology)
    techsByListing.set(row.job_listing_id, bucket)
  }

  const skillsByListing = new Map<string, Array<{ slug: string; label: string }>>()
  for (const row of (skillsRes.data ?? []) as SkillRow[]) {
    const bucket = skillsByListing.get(row.job_listing_id) ?? []
    bucket.push({ slug: row.skill_slug, label: row.skill_label })
    skillsByListing.set(row.job_listing_id, bucket)
  }

  const openings: JobOpeningRecord[] = rows
    .map((row) => {
      const metadataSources = getMetadataSources(row.metadata)
      const sources = Array.from(new Set([row.source, ...metadataSources, ...(sightingsByListing.get(row.id) ?? [])]))
      if (!matchesSourceFilter(sources, filters.source)) return null
      const sourceCount = sources.length
      const confidenceScore = getOpeningConfidenceScore(
        row.source as Parameters<typeof getOpeningConfidenceScore>[0],
        sourceCount,
        {
          salaryMin: row.salary_min,
          salaryMax: row.salary_max,
          descriptionText: row.description_text,
        }
      )
      const recommendationScore = getOpeningRecommendationScore(
        {
          source: row.source as Parameters<typeof getOpeningRecommendationScore>[0]['source'],
          postedAt: row.posted_at,
          salaryMin: row.salary_min,
          salaryMax: row.salary_max,
          isRemote: row.is_remote,
          descriptionText: row.description_text,
        },
        sourceCount
      )
      return {
        id: row.id,
        canonicalHash: row.canonical_hash,
        title: row.title,
        companyName: row.company_name,
        companySlug: row.company_slug,
        jobUrl: row.job_url,
        locationText: row.location_text,
        locationCountry: row.location_country,
        locationRegion: row.location_region,
        locationCity: row.location_city,
        isRemote: row.is_remote,
        employmentType: row.employment_type,
        seniority: row.seniority,
        roleSlug: row.role_slug,
        roleLabel: row.role_label,
        salaryMin: row.salary_min,
        salaryMax: row.salary_max,
        salaryCurrency: row.salary_currency,
        postedAt: row.posted_at,
        source: row.source,
        sourceBadges: sources.map((source) => ({ source, label: SOURCE_LABELS[source] ?? source })),
        sourceCount,
        matchedTechnologies: (techsByListing.get(row.id) ?? []).map((technology) => ({
          slug: technology.slug,
          name: technology.name,
          color: technology.color,
        })),
        extractedSkills: Array.from(new Map((skillsByListing.get(row.id) ?? []).map((skill) => [skill.slug, skill])).values()).slice(0, 5),
        confidenceScore,
        recommendationScore,
        whyThisMatters: getOpeningWhyThisMatters(
          {
            postedAt: row.posted_at,
            salaryMin: row.salary_min,
            salaryMax: row.salary_max,
            isRemote: row.is_remote,
          },
          sourceCount,
          recommendationScore
        ),
      } satisfies JobOpeningRecord
    })
    .filter((opening): opening is JobOpeningRecord => Boolean(opening))
    .sort((a, b) => b.recommendationScore - a.recommendationScore || b.confidenceScore - a.confidenceScore)

  const total = openings.length
  const pagedOpenings = openings.slice((page - 1) * pageSize, page * pageSize)
  const companies = buildCompanySummaries(openings)

  return {
    openings: pagedOpenings,
    highlights: buildHighlights(pagedOpenings.slice(0, 8), companies),
    total,
    page,
    pageSize,
    lastUpdated,
  }
}

function buildCompanySummaries(openings: JobOpeningRecord[]): JobCompanySummary[] {
  const grouped = new Map<string, JobCompanySummary>()
  for (const opening of openings) {
    const slug = opening.companySlug ?? slugifyText(opening.companyName, 'unknown-company')
    const company = grouped.get(slug) ?? {
      companySlug: slug,
      companyName: opening.companyName ?? 'Unknown company',
      activeOpenings: 0,
      recentOpenings: 0,
      remoteShare: 0,
      sourceCoverage: 0,
      topMarkets: [],
      topTechnologies: [],
    }
    company.activeOpenings += 1
    company.recentOpenings += opening.whyThisMatters.includes('Posted recently') ? 1 : 0
    company.remoteShare += opening.isRemote ? 1 : 0
    company.sourceCoverage += opening.sourceCount
    if (opening.locationCountry && !company.topMarkets.includes(opening.locationCountry)) {
      company.topMarkets.push(opening.locationCountry)
    }
    for (const technology of opening.matchedTechnologies) {
      const existing = company.topTechnologies.find((entry) => entry.slug === technology.slug)
      if (existing) existing.openings += 1
      else company.topTechnologies.push({ ...technology, openings: 1 })
    }
    grouped.set(slug, company)
  }

  return Array.from(grouped.values())
    .map((company) => ({
      ...company,
      remoteShare: company.activeOpenings > 0 ? Math.round((company.remoteShare / company.activeOpenings) * 1000) / 10 : 0,
      sourceCoverage: company.activeOpenings > 0 ? Math.round((company.sourceCoverage / company.activeOpenings) * 10) / 10 : 0,
      topMarkets: company.topMarkets.slice(0, 3),
      topTechnologies: company.topTechnologies.sort((a, b) => b.openings - a.openings).slice(0, 4),
    }))
    .sort((a, b) => b.activeOpenings - a.activeOpenings || b.recentOpenings - a.recentOpenings)
}

export async function getJobsCompanies(
  supabase: SupabaseClient,
  filters: JobOpeningsFilters = {}
): Promise<JobsCompaniesResponse> {
  const openings = await getJobsOpenings(supabase, { ...filters, page: 1, pageSize: 120 })
  const companies = buildCompanySummaries(openings.openings)
  return {
    companies,
    total: companies.length,
    lastUpdated: openings.lastUpdated,
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CompanyRadarEntry,
  HiringNowEntry,
  JobsFilterOptions,
  JobsOverviewResponse,
  LocationDemandEntry,
  RemoteStackEntry,
  RisingRoleEntry,
  SearchVsHiringPoint,
  SkillAdjacencyEntry,
  Technology,
  TechnologyCategory,
} from '@/types'
import type { NormalizedJobListing } from '@/lib/api/hasdata-jobs'
import { CANONICAL_ROLES, slugifyText } from '@/lib/jobs/taxonomy'

type TechLookup = Pick<Technology, 'id' | 'slug' | 'name' | 'color' | 'category'>
type MarketRow = {
  date: string
  technology_id: string
  active_jobs: number
  new_jobs: number
  remote_jobs: number
  company_count: number
  location_count: number
  avg_salary_min: number | null
  avg_salary_max: number | null
  search_interest: number | null
  search_velocity: number
  jobs_velocity: number
  jobs_acceleration: number
  search_vs_hiring_gap: number
  metadata: Record<string, unknown>
  updated_at: string
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 1000) / 10
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

async function getTechLookup(supabase: SupabaseClient): Promise<Map<string, TechLookup>> {
  const { data, error } = await supabase
    .from('technologies')
    .select('id, slug, name, color, category')
    .eq('is_active', true)

  if (error) throw new Error(`Failed to fetch technologies: ${error.message}`)
  return new Map(
    (data ?? []).map((row) => [
      row.id as string,
      {
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
        color: row.color as string,
        category: row.category as TechnologyCategory,
      },
    ])
  )
}

async function getLatestDate(supabase: SupabaseClient, table: string, column = 'date'): Promise<string | null> {
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .order(column, { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    const message = error.message.toLowerCase()
    if (message.includes('does not exist') || message.includes('could not find the table')) {
      return null
    }
    throw new Error(`Failed to fetch latest date from ${table}: ${error.message}`)
  }
  return (data as Record<string, unknown> | null)?.[column] as string | null ?? null
}

export async function upsertNormalizedListings(
  supabase: SupabaseClient,
  technologies: Technology[],
  listings: NormalizedJobListing[]
): Promise<{ listingsUpserted: number; techLinksUpserted: number; skillLinksUpserted: number }> {
  if (listings.length === 0) return { listingsUpserted: 0, techLinksUpserted: 0, skillLinksUpserted: 0 }

  const listingRows = listings.map((listing) => ({
    source: listing.source,
    external_id: listing.externalId,
    canonical_hash: listing.canonicalHash,
    title: listing.title,
    company_name: listing.companyName,
    company_slug: listing.companySlug,
    job_url: listing.jobUrl,
    description_text: listing.descriptionText,
    location_text: listing.locationText,
    location_country: listing.locationCountry,
    location_region: listing.locationRegion,
    location_city: listing.locationCity,
    is_remote: listing.isRemote,
    employment_type: listing.employmentType,
    seniority: listing.seniority,
    role_slug: listing.roleSlug,
    role_label: listing.roleLabel,
    salary_min: listing.salaryMin,
    salary_max: listing.salaryMax,
    salary_currency: listing.salaryCurrency,
    posted_at: listing.postedAt,
    last_seen_at: new Date().toISOString(),
    is_active: true,
    metadata: listing.metadata,
  }))

  const { data: upserted, error } = await supabase
    .from('job_listings')
    .upsert(listingRows, { onConflict: 'source,external_id' })
    .select('id, source, external_id')

  if (error) throw new Error(`Failed to upsert job listings: ${error.message}`)

  const listingIdMap = new Map((upserted ?? []).map((row) => [`${row.source}:${row.external_id}`, row.id as string]))
  const techIdBySlug = new Map(technologies.map((technology) => [technology.slug, technology.id]))

  const techLinks = listings.flatMap((listing) => {
    const listingId = listingIdMap.get(`${listing.source}:${listing.externalId}`)
    if (!listingId) return []
    return listing.matchedTechnologySlugs
      .map((slug) => techIdBySlug.get(slug))
      .filter((technologyId): technologyId is string => Boolean(technologyId))
      .map((technologyId) => ({
        job_listing_id: listingId,
        technology_id: technologyId,
        match_type: 'keyword',
        confidence: 0.8,
      }))
  })

  if (techLinks.length > 0) {
    const { error: techError } = await supabase
      .from('job_listing_technologies')
      .upsert(techLinks, { onConflict: 'job_listing_id,technology_id' })
    if (techError) throw new Error(`Failed to upsert job listing technologies: ${techError.message}`)
  }

  const skillLinks = listings.flatMap((listing) => {
    const listingId = listingIdMap.get(`${listing.source}:${listing.externalId}`)
    if (!listingId) return []
    return listing.extractedSkills.map((skill) => ({
      job_listing_id: listingId,
      skill_slug: skill.slug,
      skill_label: skill.label,
      category: skill.category,
      confidence: skill.confidence,
    }))
  })

  if (skillLinks.length > 0) {
    const { error: skillError } = await supabase
      .from('job_listing_skills')
      .upsert(skillLinks, { onConflict: 'job_listing_id,skill_slug' })
    if (skillError) throw new Error(`Failed to upsert job listing skills: ${skillError.message}`)
  }

  return {
    listingsUpserted: listingRows.length,
    techLinksUpserted: techLinks.length,
    skillLinksUpserted: skillLinks.length,
  }
}

type ListingRow = {
  id: string
  company_name: string | null
  company_slug: string | null
  location_country: string | null
  location_region: string | null
  location_city: string | null
  location_text: string | null
  is_remote: boolean
  salary_min: number | null
  salary_max: number | null
  posted_at: string | null
  role_slug: string | null
  role_label: string | null
}

export async function rebuildJobsIntelligenceRollups(
  supabase: SupabaseClient,
  asOfDate = toIsoDate(new Date())
): Promise<{ marketRows: number; roleRows: number; companyRows: number; locationRows: number; skillRows: number }> {
  const [techLookup, listingsRes, listingTechRes, listingSkillsRes, trendsRes, prevDayRes] = await Promise.all([
    getTechLookup(supabase),
    supabase
      .from('job_listings')
      .select('id, company_name, company_slug, location_country, location_region, location_city, location_text, is_remote, salary_min, salary_max, posted_at, role_slug, role_label')
      .eq('is_active', true),
    supabase.from('job_listing_technologies').select('job_listing_id, technology_id'),
    supabase.from('job_listing_skills').select('job_listing_id, skill_slug, skill_label'),
    supabase
      .from('data_points')
      .select('technology_id, metric, value')
      .eq('source', 'googletrends')
      .eq('measured_at', asOfDate),
    supabase
      .from('job_market_daily')
      .select('technology_id, active_jobs')
      .eq('date', toIsoDate(new Date(new Date(asOfDate).getTime() - 86400000))),
  ])

  if (listingsRes.error) throw new Error(`Failed to fetch job listings: ${listingsRes.error.message}`)
  if (listingTechRes.error) throw new Error(`Failed to fetch job listing technologies: ${listingTechRes.error.message}`)
  if (listingSkillsRes.error) throw new Error(`Failed to fetch job listing skills: ${listingSkillsRes.error.message}`)
  if (trendsRes.error) throw new Error(`Failed to fetch google trends data: ${trendsRes.error.message}`)
  if (prevDayRes.error) throw new Error(`Failed to fetch previous day rollup: ${prevDayRes.error.message}`)

  const listings = (listingsRes.data ?? []) as ListingRow[]
  const listingById = new Map(listings.map((listing) => [listing.id, listing]))
  const listingIdsByTech = new Map<string, string[]>()
  for (const row of listingTechRes.data ?? []) {
    const bucket = listingIdsByTech.get(row.technology_id as string) ?? []
    bucket.push(row.job_listing_id as string)
    listingIdsByTech.set(row.technology_id as string, bucket)
  }

  const trendMap = new Map<string, Record<string, number>>()
  for (const row of trendsRes.data ?? []) {
    const bucket = trendMap.get(row.technology_id as string) ?? {}
    bucket[row.metric as string] = Number(row.value ?? 0)
    trendMap.set(row.technology_id as string, bucket)
  }

  const prevActiveMap = new Map<string, number>((prevDayRes.data ?? []).map((row) => [row.technology_id as string, Number(row.active_jobs ?? 0)]))

  const marketRows: MarketRow[] = Array.from(techLookup.values()).map((technology) => {
    const techListings = (listingIdsByTech.get(technology.id) ?? [])
      .map((listingId) => listingById.get(listingId))
      .filter((listing): listing is ListingRow => Boolean(listing))
    const trend = trendMap.get(technology.id) ?? {}
    const activeJobs = techListings.length
    const remoteJobs = techListings.filter((listing) => listing.is_remote).length
    return {
      date: asOfDate,
      technology_id: technology.id,
      active_jobs: activeJobs,
      new_jobs: techListings.filter((listing) => listing.posted_at && toIsoDate(new Date(listing.posted_at)) === asOfDate).length,
      remote_jobs: remoteJobs,
      company_count: new Set(techListings.map((listing) => listing.company_slug ?? listing.company_name ?? listing.id)).size,
      location_count: new Set(techListings.map((listing) => listing.location_text ?? listing.location_country ?? 'unknown')).size,
      avg_salary_min: avg(techListings.map((listing) => listing.salary_min).filter((value): value is number => value != null)),
      avg_salary_max: avg(techListings.map((listing) => listing.salary_max).filter((value): value is number => value != null)),
      search_interest: trend.interest_index ?? null,
      search_velocity: trend.interest_velocity ?? 0,
      jobs_velocity: activeJobs - (prevActiveMap.get(technology.id) ?? 0),
      jobs_acceleration: activeJobs - (prevActiveMap.get(technology.id) ?? 0),
      search_vs_hiring_gap: (trend.interest_velocity ?? 0) - (activeJobs - (prevActiveMap.get(technology.id) ?? 0)),
      metadata: {},
      updated_at: new Date().toISOString(),
    }
  })

  const roleRowsMap = new Map<string, Record<string, unknown>>()
  const companyRowsMap = new Map<string, Record<string, unknown>>()
  const locationRowsMap = new Map<string, Record<string, unknown>>()
  const skillRowsMap = new Map<string, Record<string, unknown>>()

  const skillsByListingId = new Map<string, Array<{ skill_slug: string; skill_label: string }>>()
  for (const row of listingSkillsRes.data ?? []) {
    const bucket = skillsByListingId.get(row.job_listing_id as string) ?? []
    bucket.push({ skill_slug: row.skill_slug as string, skill_label: row.skill_label as string })
    skillsByListingId.set(row.job_listing_id as string, bucket)
  }

  for (const row of listingTechRes.data ?? []) {
    const listing = listingById.get(row.job_listing_id as string)
    if (!listing) continue

    const roleSlug = listing.role_slug ?? 'backend'
    const roleLabel = listing.role_label ?? (CANONICAL_ROLES.find((role) => role.slug === roleSlug)?.label ?? 'Backend')
    const roleKey = `${roleSlug}:${row.technology_id}`
    const roleBucket = roleRowsMap.get(roleKey) ?? {
      date: asOfDate,
      role_slug: roleSlug,
      role_label: roleLabel,
      technology_id: row.technology_id as string,
      active_jobs: 0,
      new_jobs: 0,
      remote_hits: 0,
      company_refs: [] as string[],
      growth_7d: 0,
      metadata: {},
      updated_at: new Date().toISOString(),
    }
    roleBucket.active_jobs = Number(roleBucket.active_jobs) + 1
    roleBucket.new_jobs = Number(roleBucket.new_jobs) + (listing.posted_at && toIsoDate(new Date(listing.posted_at)) === asOfDate ? 1 : 0)
    roleBucket.remote_hits = Number(roleBucket.remote_hits) + (listing.is_remote ? 1 : 0)
    ;(roleBucket.company_refs as string[]).push(listing.company_slug ?? listing.company_name ?? listing.id)
    roleBucket.growth_7d = Number(roleBucket.new_jobs)
    roleRowsMap.set(roleKey, roleBucket)

    const companySlug = listing.company_slug ?? slugifyText(listing.company_name, 'unknown-company')
    const companyKey = `${companySlug}:${row.technology_id}`
    const companyBucket = companyRowsMap.get(companyKey) ?? {
      date: asOfDate,
      company_slug: companySlug,
      company_name: listing.company_name ?? 'Unknown company',
      technology_id: row.technology_id as string,
      active_jobs: 0,
      remote_hits: 0,
      location_refs: [] as string[],
      metadata: {},
      updated_at: new Date().toISOString(),
    }
    companyBucket.active_jobs = Number(companyBucket.active_jobs) + 1
    companyBucket.remote_hits = Number(companyBucket.remote_hits) + (listing.is_remote ? 1 : 0)
    ;(companyBucket.location_refs as string[]).push(listing.location_text ?? listing.location_country ?? 'unknown')
    companyRowsMap.set(companyKey, companyBucket)

    const locationLabel = listing.location_city ?? listing.location_region ?? listing.location_country ?? 'Remote'
    const locationType = listing.location_city ? 'city' : listing.location_region ? 'region' : 'country'
    const locationSlug = slugifyText(locationLabel, 'unknown-location')
    const locationKey = `${locationSlug}:${locationType}:${row.technology_id}`
    const locationBucket = locationRowsMap.get(locationKey) ?? {
      date: asOfDate,
      location_slug: locationSlug,
      location_label: locationLabel,
      location_type: locationType,
      technology_id: row.technology_id as string,
      active_jobs: 0,
      remote_hits: 0,
      company_refs: [] as string[],
      metadata: {},
      updated_at: new Date().toISOString(),
    }
    locationBucket.active_jobs = Number(locationBucket.active_jobs) + 1
    locationBucket.remote_hits = Number(locationBucket.remote_hits) + (listing.is_remote ? 1 : 0)
    ;(locationBucket.company_refs as string[]).push(companySlug)
    locationRowsMap.set(locationKey, locationBucket)

    for (const skill of skillsByListingId.get(row.job_listing_id as string) ?? []) {
      const skillKey = `${row.technology_id}:${skill.skill_slug}`
      const skillBucket = skillRowsMap.get(skillKey) ?? {
        date: asOfDate,
        technology_id: row.technology_id as string,
        related_skill_slug: skill.skill_slug,
        related_skill_label: skill.skill_label,
        cooccurrence_count: 0,
        remote_hits: 0,
        lift_score: 0,
        metadata: {},
        updated_at: new Date().toISOString(),
      }
      skillBucket.cooccurrence_count = Number(skillBucket.cooccurrence_count) + 1
      skillBucket.remote_hits = Number(skillBucket.remote_hits) + (listing.is_remote ? 1 : 0)
      skillRowsMap.set(skillKey, skillBucket)
    }
  }

  const roleRows = Array.from(roleRowsMap.values()).map((row) => ({
    date: row.date,
    role_slug: row.role_slug,
    role_label: row.role_label,
    technology_id: row.technology_id,
    active_jobs: row.active_jobs,
    new_jobs: row.new_jobs,
    remote_ratio: pct(Number(row.remote_hits), Number(row.active_jobs)),
    company_count: new Set(row.company_refs as string[]).size,
    growth_7d: row.growth_7d,
    metadata: {},
    updated_at: row.updated_at,
  }))

  const companyRows = Array.from(companyRowsMap.values()).map((row) => ({
    date: row.date,
    company_slug: row.company_slug,
    company_name: row.company_name,
    technology_id: row.technology_id,
    active_jobs: row.active_jobs,
    remote_ratio: pct(Number(row.remote_hits), Number(row.active_jobs)),
    location_count: new Set(row.location_refs as string[]).size,
    metadata: {},
    updated_at: row.updated_at,
  }))

  const locationRows = Array.from(locationRowsMap.values()).map((row) => ({
    date: row.date,
    location_slug: row.location_slug,
    location_label: row.location_label,
    location_type: row.location_type,
    technology_id: row.technology_id,
    active_jobs: row.active_jobs,
    remote_ratio: pct(Number(row.remote_hits), Number(row.active_jobs)),
    company_count: new Set(row.company_refs as string[]).size,
    metadata: {},
    updated_at: row.updated_at,
  }))

  const totalLinks = (listingTechRes.data ?? []).length || 1
  const techActiveMap = new Map(marketRows.map((row) => [row.technology_id, row.active_jobs]))
  const skillRows = Array.from(skillRowsMap.values()).map((row) => ({
    date: row.date,
    technology_id: row.technology_id,
    related_skill_slug: row.related_skill_slug,
    related_skill_label: row.related_skill_label,
    cooccurrence_count: row.cooccurrence_count,
    lift_score: Math.round(((Number(row.cooccurrence_count) / totalLinks) / Math.max((techActiveMap.get(row.technology_id as string) ?? 1) / totalLinks, 0.001)) * 100) / 10,
    remote_ratio: pct(Number(row.remote_hits), Number(row.cooccurrence_count)),
    metadata: {},
    updated_at: row.updated_at,
  }))

  await Promise.all([
    marketRows.length > 0 ? supabase.from('job_market_daily').upsert(marketRows, { onConflict: 'date,technology_id' }) : Promise.resolve(),
    roleRows.length > 0 ? supabase.from('job_role_tech_daily').upsert(roleRows, { onConflict: 'date,role_slug,technology_id' }) : Promise.resolve(),
    companyRows.length > 0 ? supabase.from('job_company_tech_daily').upsert(companyRows, { onConflict: 'date,company_slug,technology_id' }) : Promise.resolve(),
    locationRows.length > 0 ? supabase.from('job_location_tech_daily').upsert(locationRows, { onConflict: 'date,location_slug,location_type,technology_id' }) : Promise.resolve(),
    skillRows.length > 0 ? supabase.from('job_skill_adjacency_daily').upsert(skillRows, { onConflict: 'date,technology_id,related_skill_slug' }) : Promise.resolve(),
  ])

  return { marketRows: marketRows.length, roleRows: roleRows.length, companyRows: companyRows.length, locationRows: locationRows.length, skillRows: skillRows.length }
}

async function buildFallbackOverview(supabase: SupabaseClient): Promise<JobsOverviewResponse> {
  const [techLookup, latestScoreDate] = await Promise.all([
    getTechLookup(supabase),
    getLatestDate(supabase, 'daily_scores', 'score_date'),
  ])

  const techIds = Array.from(techLookup.keys())
  const latestJobsDateResult = await supabase
    .from('data_points')
    .select('measured_at')
    .eq('metric', 'job_postings')
    .order('measured_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestJobsDateResult.error) {
    throw new Error(`Failed to fetch latest jobs date: ${latestJobsDateResult.error.message}`)
  }

  const latestJobsDate = (latestJobsDateResult.data?.measured_at as string | undefined) ?? null

  const [scoreRes, jobsRes] = await Promise.all([
    latestScoreDate
      ? supabase.from('daily_scores').select('technology_id, jobs_score, community_score, momentum').in('technology_id', techIds).eq('score_date', latestScoreDate)
      : Promise.resolve({ data: [], error: null }),
    latestJobsDate
      ? supabase.from('data_points').select('technology_id, source, value').in('technology_id', techIds).eq('metric', 'job_postings').eq('measured_at', latestJobsDate)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (scoreRes.error) throw new Error(`Failed to fetch fallback scores: ${scoreRes.error.message}`)
  if (jobsRes.error) throw new Error(`Failed to fetch fallback job signals: ${jobsRes.error.message}`)

  const scoreMap = new Map<string, { jobsScore: number | null; communityScore: number | null; momentum: number }>()
  for (const row of scoreRes.data ?? []) {
    scoreMap.set(row.technology_id as string, {
      jobsScore: row.jobs_score == null ? null : Number(row.jobs_score),
      communityScore: row.community_score == null ? null : Number(row.community_score),
      momentum: Number(row.momentum ?? 0),
    })
  }

  const totalsMap = new Map<string, { total: number; remote: number }>()
  for (const row of jobsRes.data ?? []) {
    const bucket = totalsMap.get(row.technology_id as string) ?? { total: 0, remote: 0 }
    bucket.total += Number(row.value ?? 0)
    if (row.source === 'remotive') bucket.remote += Number(row.value ?? 0)
    totalsMap.set(row.technology_id as string, bucket)
  }

  const entries = Array.from(techLookup.values()).map((technology) => {
    const totals = totalsMap.get(technology.id) ?? { total: 0, remote: 0 }
    const scores = scoreMap.get(technology.id) ?? { jobsScore: null, communityScore: null, momentum: 0 }
    return { technology, totalJobs: totals.total, remoteJobs: totals.remote, ...scores }
  }).filter((entry) => entry.totalJobs > 0 || entry.jobsScore != null)

  const hiringNow: HiringNowEntry[] = [...entries]
    .sort((a, b) => b.totalJobs - a.totalJobs || (b.jobsScore ?? 0) - (a.jobsScore ?? 0))
    .slice(0, 12)
    .map((entry) => ({
      technologyId: entry.technology.id,
      slug: entry.technology.slug,
      name: entry.technology.name,
      color: entry.technology.color,
      category: entry.technology.category,
      activeJobs: entry.totalJobs,
      jobsScore: entry.jobsScore,
      companyCount: 0,
      remoteShare: pct(entry.remoteJobs, entry.totalJobs),
      freshnessScore: Math.max(0, 50 + entry.momentum * 5),
    }))

  const searchVsHiring: SearchVsHiringPoint[] = entries
    .slice(0, 20)
    .map((entry) => {
      const jobsVelocity = entry.momentum
      const searchVelocity = (entry.communityScore ?? 0) - (entry.jobsScore ?? 0)
      const quadrant: SearchVsHiringPoint['quadrant'] =
        searchVelocity > 12 && jobsVelocity < 4 ? 'hype-risk'
        : jobsVelocity > 4 && searchVelocity > 0 ? 'real-growth'
        : jobsVelocity > 2 && searchVelocity < 0 ? 'underrated'
        : 'stable-demand'
      return {
        technologySlug: entry.technology.slug,
        technologyName: entry.technology.name,
        technologyColor: entry.technology.color,
        jobsVelocity,
        searchVelocity,
        quadrant,
        activeJobs: entry.totalJobs,
        jobsScore: entry.jobsScore,
      }
    })

  return {
    pulse: {
      totalActiveJobs: entries.reduce((sum, entry) => sum + entry.totalJobs, 0),
      totalRemoteJobs: entries.reduce((sum, entry) => sum + entry.remoteJobs, 0),
      remoteShare: pct(entries.reduce((sum, entry) => sum + entry.remoteJobs, 0), entries.reduce((sum, entry) => sum + entry.totalJobs, 0)),
      trackedCompanies: 0,
      trackedLocations: 0,
      technologiesWithDemand: entries.filter((entry) => entry.totalJobs > 0).length,
    },
    hiringNow,
    risingRoles: hiringNow.slice(0, 8).map((entry) => ({
      roleSlug: entry.category === 'frontend' ? 'frontend' : entry.category === 'mobile' ? 'mobile' : 'backend',
      roleLabel: entry.category === 'frontend' ? 'Frontend' : entry.category === 'mobile' ? 'Mobile' : 'Backend',
      technologySlug: entry.slug,
      technologyName: entry.name,
      technologyColor: entry.color,
      activeJobs: entry.activeJobs,
      growth7d: Math.round(entry.freshnessScore - 50),
      remoteRatio: entry.remoteShare,
      companyCount: 0,
    })),
    remoteFriendlyStacks: hiringNow.filter((entry) => entry.remoteShare > 0).slice(0, 8).map((entry) => ({
      technologySlug: entry.slug,
      technologyName: entry.name,
      technologyColor: entry.color,
      activeJobs: entry.activeJobs,
      remoteRatio: entry.remoteShare,
      remoteJobs: Math.round(entry.activeJobs * entry.remoteShare / 100),
      companyCount: 0,
    })),
    companyRadar: [],
    skillAdjacency: [],
    geoDemand: [],
    searchVsHiring,
    filters: {
      periods: ['7d', '30d', '90d'],
      remoteModes: ['all', 'remote', 'onsite'],
      roles: CANONICAL_ROLES.map((role) => ({ slug: role.slug, label: role.label })),
      technologies: Array.from(techLookup.values()).sort((a, b) => a.name.localeCompare(b.name)).map((technology) => ({ slug: technology.slug, name: technology.name, color: technology.color })),
      locations: [],
    },
    lastUpdated: latestJobsDate ?? latestScoreDate,
  }
}

export async function getJobsOverview(supabase: SupabaseClient): Promise<JobsOverviewResponse> {
  const latestDate = await getLatestDate(supabase, 'job_market_daily')
  if (!latestDate) return buildFallbackOverview(supabase)

  const [techLookup, marketRes, roleRes, companyRes, locationRes, skillRes] = await Promise.all([
    getTechLookup(supabase),
    supabase.from('job_market_daily').select('*').eq('date', latestDate),
    supabase.from('job_role_tech_daily').select('*').eq('date', latestDate).order('growth_7d', { ascending: false }).limit(20),
    supabase.from('job_company_tech_daily').select('*').eq('date', latestDate).order('active_jobs', { ascending: false }).limit(100),
    supabase.from('job_location_tech_daily').select('*').eq('date', latestDate).order('active_jobs', { ascending: false }).limit(100),
    supabase.from('job_skill_adjacency_daily').select('*').eq('date', latestDate).order('lift_score', { ascending: false }).limit(100),
  ])

  if (marketRes.error) throw new Error(`Failed to fetch jobs market rows: ${marketRes.error.message}`)
  if (roleRes.error) throw new Error(`Failed to fetch jobs role rows: ${roleRes.error.message}`)
  if (companyRes.error) throw new Error(`Failed to fetch jobs company rows: ${companyRes.error.message}`)
  if (locationRes.error) throw new Error(`Failed to fetch jobs location rows: ${locationRes.error.message}`)
  if (skillRes.error) throw new Error(`Failed to fetch jobs skill rows: ${skillRes.error.message}`)

  const hiringNow: HiringNowEntry[] = (marketRes.data ?? []).flatMap((row) => {
    const technology = techLookup.get(row.technology_id as string)
    if (!technology) return []
    return [{
      technologyId: technology.id,
      slug: technology.slug,
      name: technology.name,
      color: technology.color,
      category: technology.category,
      activeJobs: Number(row.active_jobs ?? 0),
      jobsScore: null,
      companyCount: Number(row.company_count ?? 0),
      remoteShare: pct(Number(row.remote_jobs ?? 0), Number(row.active_jobs ?? 0)),
      freshnessScore: Number(row.jobs_velocity ?? 0),
    }]
  }).sort((a, b) => b.activeJobs - a.activeJobs).slice(0, 12)

  const risingRoles: RisingRoleEntry[] = (roleRes.data ?? []).flatMap((row) => {
    const technology = techLookup.get(row.technology_id as string)
    if (!technology) return []
    return [{
      roleSlug: row.role_slug as string,
      roleLabel: row.role_label as string,
      technologySlug: technology.slug,
      technologyName: technology.name,
      technologyColor: technology.color,
      activeJobs: Number(row.active_jobs ?? 0),
      growth7d: Number(row.growth_7d ?? 0),
      remoteRatio: Number(row.remote_ratio ?? 0),
      companyCount: Number(row.company_count ?? 0),
    }]
  }).slice(0, 12)

  const remoteFriendlyStacks: RemoteStackEntry[] = (marketRes.data ?? []).flatMap((row) => {
    const technology = techLookup.get(row.technology_id as string)
    if (!technology || Number(row.active_jobs ?? 0) < 3) return []
    return [{
      technologySlug: technology.slug,
      technologyName: technology.name,
      technologyColor: technology.color,
      activeJobs: Number(row.active_jobs ?? 0),
      remoteRatio: pct(Number(row.remote_jobs ?? 0), Number(row.active_jobs ?? 0)),
      remoteJobs: Number(row.remote_jobs ?? 0),
      companyCount: Number(row.company_count ?? 0),
    }]
  }).sort((a, b) => b.remoteRatio - a.remoteRatio).slice(0, 10)

  const companyMap = new Map<string, CompanyRadarEntry>()
  for (const row of companyRes.data ?? []) {
    const technology = techLookup.get(row.technology_id as string)
    if (!technology) continue
    const key = row.company_slug as string
    const existing = companyMap.get(key) ?? {
      companySlug: key,
      companyName: row.company_name as string,
      activeJobs: 0,
      remoteRatio: 0,
      locationCount: 0,
      topTechnologies: [],
    }
    existing.activeJobs += Number(row.active_jobs ?? 0)
    existing.remoteRatio += Number(row.remote_ratio ?? 0) * Number(row.active_jobs ?? 0)
    existing.locationCount = Math.max(existing.locationCount, Number(row.location_count ?? 0))
    existing.topTechnologies.push({ slug: technology.slug, name: technology.name, color: technology.color, activeJobs: Number(row.active_jobs ?? 0) })
    companyMap.set(key, existing)
  }
  const companyRadar = Array.from(companyMap.values()).map((entry) => ({
    ...entry,
    remoteRatio: pct(entry.remoteRatio, entry.activeJobs * 100),
    topTechnologies: entry.topTechnologies.sort((a, b) => b.activeJobs - a.activeJobs).slice(0, 4),
  })).sort((a, b) => b.activeJobs - a.activeJobs).slice(0, 12)

  const geoDemand: LocationDemandEntry[] = (locationRes.data ?? []).flatMap((row) => {
    const technology = techLookup.get(row.technology_id as string)
    if (!technology) return []
    return [{
      locationSlug: row.location_slug as string,
      locationLabel: row.location_label as string,
      locationType: (row.location_type as 'city' | 'region' | 'country') ?? 'country',
      technologySlug: technology.slug,
      technologyName: technology.name,
      technologyColor: technology.color,
      activeJobs: Number(row.active_jobs ?? 0),
      remoteRatio: Number(row.remote_ratio ?? 0),
      companyCount: Number(row.company_count ?? 0),
    }]
  }).slice(0, 12)

  const skillAdjacency: SkillAdjacencyEntry[] = (skillRes.data ?? []).flatMap((row) => {
    const technology = techLookup.get(row.technology_id as string)
    if (!technology) return []
    return [{
      technologySlug: technology.slug,
      technologyName: technology.name,
      relatedSkillSlug: row.related_skill_slug as string,
      relatedSkillLabel: row.related_skill_label as string,
      cooccurrenceCount: Number(row.cooccurrence_count ?? 0),
      liftScore: Number(row.lift_score ?? 0),
      remoteRatio: Number(row.remote_ratio ?? 0),
    }]
  }).slice(0, 20)

  const searchVsHiring: SearchVsHiringPoint[] = (marketRes.data ?? []).flatMap((row) => {
    const technology = techLookup.get(row.technology_id as string)
    if (!technology) return []
    const jobsVelocity = Number(row.jobs_velocity ?? 0)
    const searchVelocity = Number(row.search_velocity ?? 0)
    const quadrant: SearchVsHiringPoint['quadrant'] =
      searchVelocity > 4 && jobsVelocity < 2 ? 'hype-risk'
      : jobsVelocity > 2 && searchVelocity > 2 ? 'real-growth'
      : jobsVelocity > 2 && searchVelocity <= 0 ? 'underrated'
      : 'stable-demand'
    return [{
      technologySlug: technology.slug,
      technologyName: technology.name,
      technologyColor: technology.color,
      jobsVelocity,
      searchVelocity,
      quadrant,
      activeJobs: Number(row.active_jobs ?? 0),
      jobsScore: null,
    }]
  }).slice(0, 20)

  const locationOptions = new Map<string, { slug: string; label: string; type: 'city' | 'region' | 'country' }>()
  for (const entry of geoDemand) locationOptions.set(`${entry.locationSlug}:${entry.locationType}`, { slug: entry.locationSlug, label: entry.locationLabel, type: entry.locationType })

  return {
    pulse: {
      totalActiveJobs: (marketRes.data ?? []).reduce((sum, row) => sum + Number(row.active_jobs ?? 0), 0),
      totalRemoteJobs: (marketRes.data ?? []).reduce((sum, row) => sum + Number(row.remote_jobs ?? 0), 0),
      remoteShare: pct((marketRes.data ?? []).reduce((sum, row) => sum + Number(row.remote_jobs ?? 0), 0), (marketRes.data ?? []).reduce((sum, row) => sum + Number(row.active_jobs ?? 0), 0)),
      trackedCompanies: companyMap.size,
      trackedLocations: locationOptions.size,
      technologiesWithDemand: (marketRes.data ?? []).filter((row) => Number(row.active_jobs ?? 0) > 0).length,
    },
    hiringNow,
    risingRoles,
    remoteFriendlyStacks,
    companyRadar,
    skillAdjacency,
    geoDemand,
    searchVsHiring,
    filters: {
      periods: ['7d', '30d', '90d'],
      remoteModes: ['all', 'remote', 'onsite'],
      roles: CANONICAL_ROLES.map((role) => ({ slug: role.slug, label: role.label })),
      technologies: Array.from(techLookup.values()).sort((a, b) => a.name.localeCompare(b.name)).map((technology) => ({ slug: technology.slug, name: technology.name, color: technology.color })),
      locations: Array.from(locationOptions.values()).sort((a, b) => a.label.localeCompare(b.label)),
    },
    lastUpdated: latestDate,
  }
}

export async function getJobsRoleRows(supabase: SupabaseClient, technologySlug?: string | null): Promise<RisingRoleEntry[]> {
  const overview = await getJobsOverview(supabase)
  return technologySlug ? overview.risingRoles.filter((entry) => entry.technologySlug === technologySlug) : overview.risingRoles
}

export async function getJobsCompanyRows(supabase: SupabaseClient, technologySlug?: string | null): Promise<CompanyRadarEntry[]> {
  const overview = await getJobsOverview(supabase)
  return technologySlug ? overview.companyRadar.filter((entry) => entry.topTechnologies.some((technology) => technology.slug === technologySlug)) : overview.companyRadar
}

export async function getJobsLocationRows(supabase: SupabaseClient, technologySlug?: string | null): Promise<LocationDemandEntry[]> {
  const overview = await getJobsOverview(supabase)
  return technologySlug ? overview.geoDemand.filter((entry) => entry.technologySlug === technologySlug) : overview.geoDemand
}

export async function getJobsSkillAdjacencyRows(supabase: SupabaseClient, technologySlug?: string | null): Promise<SkillAdjacencyEntry[]> {
  const overview = await getJobsOverview(supabase)
  return technologySlug ? overview.skillAdjacency.filter((entry) => entry.technologySlug === technologySlug) : overview.skillAdjacency
}

export async function getJobsSearchVsHiringRows(supabase: SupabaseClient): Promise<SearchVsHiringPoint[]> {
  const overview = await getJobsOverview(supabase)
  return overview.searchVsHiring
}

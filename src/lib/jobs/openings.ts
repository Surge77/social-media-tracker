import { createHash } from 'node:crypto'
import type { JobListingSource, NormalizedJobListing } from '@/lib/api/hasdata-jobs'

export interface AggregatedJobOpening {
  canonicalHash: string
  source: JobListingSource
  sources: JobListingSource[]
  sourceCount: number
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
  extractedSkills: NormalizedJobListing['extractedSkills']
  confidenceScore: number
  recommendationScore: number
  whyThisMatters: string[]
  sightings: Array<{
    source: JobListingSource
    externalId: string
    jobUrl: string | null
    postedAt: string | null
    metadata: Record<string, unknown>
  }>
}

const SOURCE_PRIORITY: Record<JobListingSource, number> = {
  hasdata_indeed: 90,
  serpapi_google_jobs: 86,
  jsearch: 82,
  adzuna: 78,
  arbeitnow: 70,
  remotive: 68,
}

function normalizeKeyPart(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function buildCanonicalOpeningHash(listing: NormalizedJobListing): string {
  const basis = [
    normalizeKeyPart(listing.title),
    normalizeKeyPart(listing.companyName),
    normalizeKeyPart(listing.locationCity ?? listing.locationRegion ?? listing.locationCountry ?? listing.locationText ?? (listing.isRemote ? 'remote' : '')),
    normalizeKeyPart(listing.roleSlug),
  ].join('||')

  return createHash('sha1').update(basis).digest('hex')
}

function mergeSkills(listings: NormalizedJobListing[]): NormalizedJobListing['extractedSkills'] {
  const deduped = new Map<string, NormalizedJobListing['extractedSkills'][number]>()
  for (const listing of listings) {
    for (const skill of listing.extractedSkills) {
      const current = deduped.get(skill.slug)
      if (!current || skill.confidence > current.confidence) {
        deduped.set(skill.slug, skill)
      }
    }
  }
  return Array.from(deduped.values()).sort((a, b) => b.confidence - a.confidence)
}

function mergeTechnologies(listings: NormalizedJobListing[]): string[] {
  return Array.from(new Set(listings.flatMap((listing) => listing.matchedTechnologySlugs)))
}

function choosePrimaryListing(listings: NormalizedJobListing[]): NormalizedJobListing {
  return [...listings].sort((a, b) => {
    const priorityDiff = (SOURCE_PRIORITY[b.source] ?? 0) - (SOURCE_PRIORITY[a.source] ?? 0)
    if (priorityDiff !== 0) return priorityDiff
    const salaryDiff = Number((b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0))
    if (salaryDiff !== 0) return salaryDiff
    return Number(new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime())
  })[0]
}

export function getOpeningFreshnessScore(postedAt: string | null): number {
  if (!postedAt) return 20
  const ageMs = Date.now() - new Date(postedAt).getTime()
  const ageDays = ageMs / (24 * 60 * 60 * 1000)
  if (ageDays <= 2) return 30
  if (ageDays <= 7) return 22
  if (ageDays <= 14) return 12
  return 4
}

export function getOpeningConfidenceScore(
  source: JobListingSource,
  sourceCount: number,
  details: {
    salaryMin?: number | null
    salaryMax?: number | null
    descriptionText?: string | null
  } = {}
): number {
  let score = Math.min(100, (SOURCE_PRIORITY[source] ?? 60))
  if (sourceCount > 1) score += Math.min(12, (sourceCount - 1) * 6)
  if (details.salaryMin != null || details.salaryMax != null) score += 6
  if (details.descriptionText) score += 4
  return Math.min(100, score)
}

function buildConfidenceScore(primary: NormalizedJobListing, sourceCount: number): number {
  return getOpeningConfidenceScore(primary.source, sourceCount, primary)
}

export function getOpeningRecommendationScore(
  input: {
    source: JobListingSource
    postedAt: string | null
    salaryMin?: number | null
    salaryMax?: number | null
    isRemote?: boolean
    descriptionText?: string | null
  },
  sourceCount: number
): number {
  const confidenceScore = getOpeningConfidenceScore(input.source, sourceCount, input)
  let score = confidenceScore * 0.55
  score += getOpeningFreshnessScore(input.postedAt)
  if (input.salaryMin != null || input.salaryMax != null) score += 8
  if (sourceCount > 1) score += Math.min(10, sourceCount * 3)
  if (input.isRemote) score += 4
  return Math.round(score * 10) / 10
}

function buildRecommendationScore(primary: NormalizedJobListing, sourceCount: number, confidenceScore: number): number {
  void confidenceScore
  return getOpeningRecommendationScore(primary, sourceCount)
}

export function getOpeningWhyThisMatters(
  input: {
    postedAt: string | null
    salaryMin?: number | null
    salaryMax?: number | null
    isRemote?: boolean
  },
  sourceCount: number,
  recommendationScore: number
): string[] {
  const reasons: string[] = []
  if (sourceCount > 1) reasons.push(`Seen on ${sourceCount} sources`)
  if (input.postedAt && getOpeningFreshnessScore(input.postedAt) >= 22) reasons.push('Posted recently')
  if (input.salaryMin != null || input.salaryMax != null) reasons.push('Salary disclosed')
  if (input.isRemote) reasons.push('Remote-friendly')
  if (recommendationScore >= 75) reasons.push('High-confidence fit')
  return reasons.slice(0, 4)
}

function buildWhyThisMatters(primary: NormalizedJobListing, sourceCount: number, recommendationScore: number): string[] {
  return getOpeningWhyThisMatters(primary, sourceCount, recommendationScore)
}

export function mergeNormalizedListings(listings: NormalizedJobListing[]): AggregatedJobOpening[] {
  const grouped = new Map<string, NormalizedJobListing[]>()

  for (const listing of listings) {
    const canonicalHash = buildCanonicalOpeningHash(listing)
    const bucket = grouped.get(canonicalHash) ?? []
    bucket.push({ ...listing, canonicalHash })
    grouped.set(canonicalHash, bucket)
  }

  return Array.from(grouped.entries()).map(([canonicalHash, bucket]) => {
    const primary = choosePrimaryListing(bucket)
    const sourceCount = new Set(bucket.map((listing) => listing.source)).size
    const confidenceScore = buildConfidenceScore(primary, sourceCount)
    const recommendationScore = buildRecommendationScore(primary, sourceCount, confidenceScore)

    return {
      canonicalHash,
      source: primary.source,
      sources: Array.from(new Set(bucket.map((listing) => listing.source))),
      sourceCount,
      title: primary.title,
      companyName: primary.companyName,
      companySlug: primary.companySlug,
      jobUrl: primary.jobUrl,
      descriptionText: primary.descriptionText,
      locationText: primary.locationText,
      locationCountry: primary.locationCountry,
      locationRegion: primary.locationRegion,
      locationCity: primary.locationCity,
      isRemote: bucket.some((listing) => listing.isRemote),
      employmentType: primary.employmentType,
      seniority: primary.seniority,
      roleSlug: primary.roleSlug,
      roleLabel: primary.roleLabel,
      salaryMin: primary.salaryMin,
      salaryMax: primary.salaryMax,
      salaryCurrency: primary.salaryCurrency,
      postedAt: primary.postedAt,
      metadata: primary.metadata,
      matchedTechnologySlugs: mergeTechnologies(bucket),
      extractedSkills: mergeSkills(bucket),
      confidenceScore,
      recommendationScore,
      whyThisMatters: buildWhyThisMatters(primary, sourceCount, recommendationScore),
      sightings: bucket.map((listing) => ({
        source: listing.source,
        externalId: listing.externalId,
        jobUrl: listing.jobUrl,
        postedAt: listing.postedAt,
        metadata: listing.metadata,
      })),
    }
  })
}

export function sortJobOpenings(openings: AggregatedJobOpening[]): AggregatedJobOpening[] {
  return [...openings].sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore
    }
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore
    }
    return new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime()
  })
}

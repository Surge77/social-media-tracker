import { describe, expect, it } from 'vitest'
import type { NormalizedJobListing } from '@/lib/api/hasdata-jobs'
import { mergeNormalizedListings, sortJobOpenings } from '@/lib/jobs/openings'

function makeListing(overrides: Partial<NormalizedJobListing>): NormalizedJobListing {
  return {
    source: 'hasdata_indeed',
    externalId: 'listing-1',
    canonicalHash: 'legacy-hash',
    title: 'Senior React Engineer',
    companyName: 'Acme',
    companySlug: 'acme',
    jobUrl: 'https://example.com/jobs/1',
    descriptionText: 'Build React and TypeScript applications on AWS.',
    locationText: 'Remote, United States',
    locationCountry: 'United States',
    locationRegion: null,
    locationCity: null,
    isRemote: true,
    employmentType: 'full-time',
    seniority: 'senior',
    roleSlug: 'frontend',
    roleLabel: 'Frontend',
    salaryMin: 150000,
    salaryMax: 190000,
    salaryCurrency: 'USD',
    postedAt: '2026-03-17T08:00:00.000Z',
    metadata: {},
    matchedTechnologySlugs: ['react', 'typescript'],
    extractedSkills: [
      { slug: 'react', label: 'React', category: 'framework', confidence: 0.9 },
      { slug: 'typescript', label: 'TypeScript', category: 'language', confidence: 0.8 },
    ],
    ...overrides,
  }
}

describe('job openings aggregation', () => {
  it('merges repeated openings from different sources into one canonical opening', () => {
    const merged = mergeNormalizedListings([
      makeListing({
        source: 'hasdata_indeed',
        externalId: 'indeed-1',
        jobUrl: 'https://indeed.example/jobs/1',
      }),
      makeListing({
        source: 'jsearch',
        externalId: 'jsearch-1',
        jobUrl: 'https://jsearch.example/jobs/1',
      }),
      makeListing({
        source: 'remotive',
        externalId: 'remotive-2',
        title: 'Staff Platform Engineer',
        roleSlug: 'devops-platform',
        roleLabel: 'DevOps / Platform',
        companyName: 'Orbit',
        companySlug: 'orbit',
        jobUrl: 'https://remotive.example/jobs/2',
        matchedTechnologySlugs: ['aws'],
        extractedSkills: [{ slug: 'aws', label: 'AWS', category: 'cloud', confidence: 0.75 }],
      }),
    ])

    expect(merged).toHaveLength(2)

    const acmeOpening = merged.find((opening) => opening.companySlug === 'acme')
    expect(acmeOpening).toBeDefined()
    expect(acmeOpening?.sourceCount).toBe(2)
    expect(acmeOpening?.sources).toEqual(expect.arrayContaining(['hasdata_indeed', 'jsearch']))
    expect(acmeOpening?.matchedTechnologySlugs).toEqual(expect.arrayContaining(['react', 'typescript']))
    expect(acmeOpening?.confidenceScore).toBeGreaterThan(70)
    expect(acmeOpening?.whyThisMatters.join(' ')).toContain('2 sources')
  })

  it('ranks fresher, richer, multi-source openings ahead of thinner records', () => {
    const openings = mergeNormalizedListings([
      makeListing({
        source: 'hasdata_indeed',
        externalId: 'indeed-1',
      }),
      makeListing({
        source: 'jsearch',
        externalId: 'jsearch-1',
      }),
      makeListing({
        source: 'arbeitnow',
        externalId: 'arbeit-2',
        companyName: 'ThinCo',
        companySlug: 'thinco',
        title: 'React Developer',
        salaryMin: null,
        salaryMax: null,
        descriptionText: null,
        postedAt: '2026-02-01T08:00:00.000Z',
        matchedTechnologySlugs: ['react'],
        extractedSkills: [],
      }),
    ])

    const sorted = sortJobOpenings(openings)
    expect(sorted[0]?.companySlug).toBe('acme')
    expect(sorted[0]?.recommendationScore).toBeGreaterThan(sorted[1]?.recommendationScore ?? 0)
  })
})

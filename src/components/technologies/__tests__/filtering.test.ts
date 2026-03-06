import { describe, expect, it } from 'vitest'
import type { TechnologyWithScore } from '@/types'
import { filterTechnologiesForDisplay } from '@/components/technologies/filtering'

function makeTech(overrides: Partial<TechnologyWithScore>): TechnologyWithScore {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    slug: overrides.slug ?? 'tech',
    name: overrides.name ?? 'Tech',
    description: overrides.description ?? 'Test technology',
    category: overrides.category ?? 'backend',
    ecosystem: null,
    website_url: null,
    github_repo: null,
    npm_package: null,
    pypi_package: null,
    crates_package: null,
    stackoverflow_tag: '',
    subreddit: null,
    devto_tag: null,
    aliases: [],
    color: overrides.color ?? '#000000',
    first_appeared: null,
    maintained_by: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    packagist_package: null,
    rubygems_package: null,
    nuget_package: null,
    pubdev_package: null,
    composite_score: overrides.composite_score ?? 50,
    github_score: overrides.github_score ?? 50,
    community_score: overrides.community_score ?? 45,
    jobs_score: overrides.jobs_score ?? 50,
    ecosystem_score: overrides.ecosystem_score ?? 50,
    onchain_score: overrides.onchain_score ?? null,
    momentum: overrides.momentum ?? 0,
    data_completeness: overrides.data_completeness ?? 1,
    sparkline: overrides.sparkline ?? [],
    previous_rank: overrides.previous_rank ?? null,
    rank_change: overrides.rank_change ?? null,
    rank: overrides.rank ?? null,
    ai_summary: overrides.ai_summary ?? '',
    confidence_grade: overrides.confidence_grade ?? null,
    lifecycle_stage: overrides.lifecycle_stage,
    lifecycle_label: overrides.lifecycle_label,
    github_stars: overrides.github_stars,
    npm_downloads: overrides.npm_downloads,
    so_questions: overrides.so_questions,
    job_postings: overrides.job_postings,
    hn_mentions: overrides.hn_mentions,
  }
}

describe('filterTechnologiesForDisplay', () => {
  it('preserves hidden-gems smart ranking instead of generic score sorting', () => {
    const technologies = [
      makeTech({
        name: 'Mainstream',
        slug: 'mainstream',
        jobs_score: 80,
        composite_score: 54,
        community_score: 48,
        momentum: 12,
        rank: 2,
      }),
      makeTech({
        name: 'Undervalued',
        slug: 'undervalued',
        jobs_score: 72,
        composite_score: 49,
        community_score: 42,
        momentum: 8,
        rank: 20,
      }),
      makeTech({
        name: 'Steady Pick',
        slug: 'steady-pick',
        jobs_score: 66,
        composite_score: 51,
        community_score: 41,
        momentum: -1,
        rank: 24,
      }),
    ]

    const result = filterTechnologiesForDisplay(technologies, {
      searchQuery: '',
      selectedCategory: 'all',
      smartFilter: 'hidden-gems',
      sortKey: 'score',
    })

    expect(result.map((tech) => tech.slug)).toEqual(['undervalued', 'steady-pick'])
  })

  it('returns overhyped technologies when buzz materially exceeds hiring', () => {
    const technologies = [
      makeTech({
        name: 'Buzzy Framework',
        slug: 'buzzy-framework',
        community_score: 58,
        jobs_score: 30,
        composite_score: 49,
        momentum: 1,
      }),
      makeTech({
        name: 'Balanced Option',
        slug: 'balanced-option',
        community_score: 52,
        jobs_score: 47,
        composite_score: 51,
        momentum: 0,
      }),
    ]

    const result = filterTechnologiesForDisplay(technologies, {
      searchQuery: '',
      selectedCategory: 'all',
      smartFilter: 'overhyped',
      sortKey: 'score',
    })

    expect(result.map((tech) => tech.slug)).toEqual(['buzzy-framework'])
  })
})

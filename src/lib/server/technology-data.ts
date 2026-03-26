import { unstable_cache } from 'next/cache'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { generateTechSummary } from '@/lib/insights/ai-summaries'
import { getLifecycleDescription, type LifecycleStage } from '@/lib/analysis/lifecycle'
import type { TechnologyWithScore, TechnologyCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import {
  getCanonicalScoringDate,
  getNearestDateAtOrBefore,
  getTargetDateDaysAgo,
} from '@/lib/scoring/scoring-date'
import {
  selectCoolingEntry,
  selectHiddenGemEntry,
  selectHottestEntry,
  selectTopScoreEntry,
} from '@/lib/technologies/market-pulse'

type TrendLabel = 'Booming' | 'Growing' | 'Stable' | 'Mature' | 'Cooling'

type MergedTech = {
  technology_id: string
  slug: string
  name: string
  category: TechnologyCategory
  color: string
  composite_score: number
  jobs_score: number | null
  community_score: number | null
  github_score: number | null
  ecosystem_score: number | null
  momentum: number
}

export interface TechnologiesResponse {
  technologies: TechnologyWithScore[]
  last_updated: string | null
}

export interface TechStatsResponse {
  market_pulse: {
    hottest: { name: string; slug: string; color: string; composite_score: number; score_delta: number } | null
    most_demanded: { name: string; slug: string; color: string; composite_score: number; score_delta: number | null } | null
    cooling: { name: string; slug: string; color: string; composite_score: number; score_delta: number } | null
    hidden_gem: { name: string; slug: string; color: string; composite_score: number; score_delta: number | null } | null
    trending: { name: string; slug: string; color: string; momentum: number }[]
    safest_bet: { name: string; slug: string; color: string; composite_score: number; score_delta: number | null } | null
  }
  category_health: {
    category: TechnologyCategory
    label: string
    count: number
    avg_score: number
    avg_momentum: number
    trend_label: TrendLabel
    best_tech: { name: string; slug: string; score: number }
  }[]
  score_distribution: {
    bucket: string
    count: number
  }[]
  weekly_digest: {
    highlights: string[]
    period: string
    new_techs_added: number
  }
  popular_stacks: {
    name: string
    description: string
    emoji: string
    technologies: { name: string; slug: string; color: string; score: number }[]
    avg_score: number
  }[]
  last_updated: string | null
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function trendLabel(avgMomentum: number): TrendLabel {
  if (avgMomentum > 8) return 'Booming'
  if (avgMomentum > 3) return 'Growing'
  if (avgMomentum > -3) return 'Stable'
  if (avgMomentum > -8) return 'Mature'
  return 'Cooling'
}

const STACK_TEMPLATES = [
  { name: 'Full-Stack Web', emoji: '🎯', description: 'Modern web development', slugs: ['react', 'nodejs', 'typescript', 'postgresql'] },
  { name: 'AI/ML Engineering', emoji: '🤖', description: 'Machine learning & AI', slugs: ['python', 'pytorch', 'tensorflow', 'fastapi'] },
  { name: 'Mobile Development', emoji: '📱', description: 'Cross-platform mobile', slugs: ['react-native', 'typescript', 'firebase'] },
  { name: 'DevOps & Cloud', emoji: '☁️', description: 'Infrastructure & CI/CD', slugs: ['docker', 'kubernetes', 'terraform', 'aws'] },
  { name: 'Backend Heavy', emoji: '⚙️', description: 'Scalable services', slugs: ['go', 'postgresql', 'redis', 'docker'] },
]

async function loadTechnologiesResponse(): Promise<TechnologiesResponse> {
  const supabase = createSupabaseAdminClient()
  const { lastUpdated, scoringDate } = await getCanonicalScoringDate(supabase)
  const sevenDaysAgoStr = scoringDate ? getTargetDateDaysAgo(scoringDate, 7) : null
  const previousDate = sevenDaysAgoStr
    ? await getNearestDateAtOrBefore(supabase, sevenDaysAgoStr, true)
    : null
  const thirtyDaysAgoStr = scoringDate ? getTargetDateDaysAgo(scoringDate, 30) : null

  const [techResult, scoresResult, previousScoresResult, sparklineResult] = await Promise.all([
    supabase
      .from('technologies')
      .select('id, slug, name, description, category, color')
      .eq('is_active', true),
    scoringDate
      ? supabase
          .from('daily_scores')
          .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum, data_completeness, raw_sub_scores')
          .eq('score_date', scoringDate)
      : Promise.resolve({ data: null }),
    previousDate
      ? supabase
          .from('daily_scores')
          .select('technology_id, composite_score')
          .eq('score_date', previousDate)
      : Promise.resolve({ data: null }),
    scoringDate && thirtyDaysAgoStr
      ? supabase
          .from('daily_scores')
          .select('technology_id, score_date, composite_score')
          .gte('score_date', thirtyDaysAgoStr)
          .order('score_date', { ascending: true })
      : Promise.resolve({ data: null }),
  ])

  const { data: technologies, error: techError } = techResult
  if (techError) {
    throw new Error(`Failed to fetch technologies: ${techError.message}`)
  }

  const scoreMap = new Map<string, Record<string, unknown>>()
  for (const score of scoresResult.data ?? []) {
    scoreMap.set(score.technology_id, score)
  }

  const previousScoreMap = new Map<string, Record<string, unknown>>()
  for (const score of previousScoresResult.data ?? []) {
    previousScoreMap.set(score.technology_id, score)
  }

  const sparklineMap = new Map<string, number[]>()
  for (const row of sparklineResult.data ?? []) {
    const points = sparklineMap.get(row.technology_id) ?? []
    points.push(Number(row.composite_score))
    sparklineMap.set(row.technology_id, points)
  }

  const technologiesWithScores: TechnologyWithScore[] = (technologies ?? []).map((tech) => {
    const scores = scoreMap.get(tech.id)
    const rawSub = scores?.raw_sub_scores as Record<string, unknown> | undefined
    const confidenceGrade = (rawSub?.confidence as Record<string, unknown> | undefined)?.grade as string | undefined

    return {
      ...tech,
      composite_score: scores?.composite_score != null ? Number(scores.composite_score) : null,
      github_score: scores?.github_score != null ? Number(scores.github_score) : null,
      community_score: scores?.community_score != null ? Number(scores.community_score) : null,
      jobs_score: scores?.jobs_score != null ? Number(scores.jobs_score) : null,
      ecosystem_score: scores?.ecosystem_score != null ? Number(scores.ecosystem_score) : null,
      momentum: scores?.momentum != null ? Number(scores.momentum) : null,
      data_completeness: scores?.data_completeness != null ? Number(scores.data_completeness) : null,
      sparkline: sparklineMap.get(tech.id) ?? [],
      previous_rank: null,
      rank_change: null,
      rank: null,
      ai_summary: '',
      confidence_grade: confidenceGrade ?? null,
    } as TechnologyWithScore
  })

  technologiesWithScores.sort((a, b) => {
    if (a.composite_score === null && b.composite_score === null) return 0
    if (a.composite_score === null) return 1
    if (b.composite_score === null) return -1
    return b.composite_score - a.composite_score
  })

  const previousRanking = [...technologiesWithScores].sort((a, b) => {
    const prevScoreA = previousScoreMap.get(a.id)
    const prevScoreB = previousScoreMap.get(b.id)
    const scoreA = prevScoreA ? Number(prevScoreA.composite_score) : null
    const scoreB = prevScoreB ? Number(prevScoreB.composite_score) : null
    if (scoreA === null && scoreB === null) return 0
    if (scoreA === null) return 1
    if (scoreB === null) return -1
    return scoreB - scoreA
  })

  const previousRankMap = new Map<string, number>()
  previousRanking.forEach((tech, index) => {
    previousRankMap.set(tech.id, index + 1)
  })

  technologiesWithScores.forEach((tech, index) => {
    const currentRank = index + 1
    const previousRank = previousRankMap.get(tech.id) ?? null
    tech.previous_rank = previousRank
    tech.rank_change = previousRank !== null ? previousRank - currentRank : null
    tech.rank = currentRank
    tech.ai_summary = generateTechSummary(tech)

    const scores = scoreMap.get(tech.id)
    const rawSub = scores?.raw_sub_scores as Record<string, unknown> | undefined
    const storedLifecycle = rawSub?.lifecycle as Record<string, unknown> | undefined
    if (storedLifecycle?.stage) {
      const stage = storedLifecycle.stage as LifecycleStage
      tech.lifecycle_stage = stage
      tech.lifecycle_label = getLifecycleDescription(stage)
    }
  })

  return {
    technologies: technologiesWithScores,
    last_updated: lastUpdated,
  }
}

async function loadTechStatsResponse(): Promise<TechStatsResponse> {
  const supabase = createSupabaseAdminClient()
  const { lastUpdated, scoringDate } = await getCanonicalScoringDate(supabase)
  if (!lastUpdated) {
    throw new Error('No score data available yet')
  }

  const activeScoringDate = scoringDate ?? lastUpdated
  const targetPrevDate = getTargetDateDaysAgo(activeScoringDate, 7)
  const previousDate = await getNearestDateAtOrBefore(supabase, targetPrevDate, true)

  const [techResult, latestScoresResult, previousScoresResult, newTechsResult] = await Promise.all([
    supabase
      .from('technologies')
      .select('id, slug, name, category, color')
      .eq('is_active', true),
    supabase
      .from('daily_scores')
      .select('technology_id, composite_score, community_score, github_score, ecosystem_score, momentum, jobs_score')
      .eq('score_date', activeScoringDate),
    previousDate
      ? supabase
          .from('daily_scores')
          .select('technology_id, composite_score, jobs_score')
          .eq('score_date', previousDate)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from('technologies')
      .select('id')
      .eq('is_active', true)
      .gte('created_at', previousDate ?? activeScoringDate),
  ])

  if (techResult.error) {
    throw new Error(techResult.error.message)
  }

  const scoreMap = new Map<string, MergedTech>()
  for (const score of latestScoresResult.data ?? []) {
    const tech = (techResult.data ?? []).find((entry) => entry.id === score.technology_id)
    if (!tech) continue

    scoreMap.set(score.technology_id, {
      technology_id: tech.id,
      slug: tech.slug as string,
      name: tech.name as string,
      category: tech.category as TechnologyCategory,
      color: tech.color as string,
      composite_score: Number(score.composite_score ?? 0),
      jobs_score: score.jobs_score != null ? Number(score.jobs_score) : null,
      community_score: score.community_score != null ? Number(score.community_score) : null,
      github_score: score.github_score != null ? Number(score.github_score) : null,
      ecosystem_score: score.ecosystem_score != null ? Number(score.ecosystem_score) : null,
      momentum: Number(score.momentum ?? 0),
    })
  }

  const merged = Array.from(scoreMap.values())
  if (merged.length === 0) {
    throw new Error('No scored technologies found')
  }

  const prevScoreMap = new Map<string, number>()
  const prevJobsMap = new Map<string, number | null>()
  for (const score of previousScoresResult.data ?? []) {
    prevScoreMap.set(score.technology_id, Number(score.composite_score ?? 0))
    prevJobsMap.set(score.technology_id, score.jobs_score != null ? Number(score.jobs_score) : null)
  }

  const withDelta = merged.map((tech) => ({
    ...tech,
    score_delta: tech.composite_score - (prevScoreMap.get(tech.technology_id) ?? tech.composite_score),
    jobs_delta: (() => {
      const prevJobs = prevJobsMap.get(tech.technology_id)
      if (prevJobs == null || tech.jobs_score == null) return null
      return tech.jobs_score - prevJobs
    })(),
  }))

  const comparableDelta = withDelta.filter((tech) => prevScoreMap.has(tech.technology_id))
  const sortedByDelta = [...comparableDelta].sort((a, b) => b.score_delta - a.score_delta)
  const sortedByMomentum = [...merged].sort((a, b) => b.momentum - a.momentum)
  const hasPrevData = comparableDelta.length > 0
  const pulseSource = hasPrevData ? comparableDelta : withDelta
  const topScore = selectTopScoreEntry(merged)
  const hottestEntry = selectHottestEntry(pulseSource, {
    hasPreviousData: hasPrevData,
    excludeTechnologyIds: topScore ? [topScore.technology_id] : [],
  })

  const usedTechnologyIds = new Set<string>()
  if (topScore) usedTechnologyIds.add(topScore.technology_id)
  if (hottestEntry) usedTechnologyIds.add(hottestEntry.technology_id)

  const coolingEntry = selectCoolingEntry(pulseSource, {
    hasPreviousData: hasPrevData,
    excludeTechnologyIds: usedTechnologyIds,
  })
  if (coolingEntry) usedTechnologyIds.add(coolingEntry.technology_id)

  const hiddenGem = selectHiddenGemEntry(withDelta, { excludeTechnologyIds: usedTechnologyIds })
  if (hiddenGem) usedTechnologyIds.add(hiddenGem.technology_id)

  const safestBet = selectTopScoreEntry(
    merged.filter((tech) => Math.abs(tech.momentum) < 5),
    { excludeTechnologyIds: usedTechnologyIds }
  )

  const withDeltaById = new Map(withDelta.map((tech) => [tech.technology_id, tech]))
  const hottestDelta = hottestEntry
    ? Math.round((hasPrevData
      ? (withDeltaById.get(hottestEntry.technology_id)?.score_delta ?? 0)
      : hottestEntry.momentum / 10) * 10) / 10
    : 0
  const coolingDelta = coolingEntry
    ? Math.round((hasPrevData
      ? (withDeltaById.get(coolingEntry.technology_id)?.score_delta ?? 0)
      : coolingEntry.momentum / 10) * 10) / 10
    : 0

  const market_pulse = {
    hottest: hottestEntry ? {
      name: hottestEntry.name,
      slug: hottestEntry.slug,
      color: hottestEntry.color,
      composite_score: Math.round(hottestEntry.composite_score),
      score_delta: hottestDelta,
    } : null,
    most_demanded: topScore ? {
      name: topScore.name,
      slug: topScore.slug,
      color: topScore.color,
      composite_score: Math.round(topScore.composite_score),
      score_delta: withDeltaById.get(topScore.technology_id)
        ? Math.round((withDeltaById.get(topScore.technology_id)!.score_delta ?? 0) * 10) / 10
        : null,
    } : null,
    cooling: coolingEntry ? {
      name: coolingEntry.name,
      slug: coolingEntry.slug,
      color: coolingEntry.color,
      composite_score: Math.round(coolingEntry.composite_score),
      score_delta: coolingDelta,
    } : null,
    hidden_gem: hiddenGem ? {
      name: hiddenGem.name,
      slug: hiddenGem.slug,
      color: hiddenGem.color,
      composite_score: Math.round(hiddenGem.composite_score),
      score_delta: withDeltaById.get(hiddenGem.technology_id)
        ? Math.round((withDeltaById.get(hiddenGem.technology_id)!.score_delta ?? 0) * 10) / 10
        : null,
    } : null,
    trending: sortedByMomentum.slice(0, 3).map((tech) => ({
      name: tech.name,
      slug: tech.slug,
      color: tech.color,
      momentum: Math.round(tech.momentum * 10) / 10,
    })),
    safest_bet: safestBet ? {
      name: safestBet.name,
      slug: safestBet.slug,
      color: safestBet.color,
      composite_score: Math.round(safestBet.composite_score),
      score_delta: withDeltaById.get(safestBet.technology_id)
        ? Math.round((withDeltaById.get(safestBet.technology_id)!.score_delta ?? 0) * 10) / 10
        : null,
    } : null,
  }

  const categoryGroups = new Map<TechnologyCategory, MergedTech[]>()
  for (const tech of merged) {
    const techs = categoryGroups.get(tech.category) ?? []
    techs.push(tech)
    categoryGroups.set(tech.category, techs)
  }

  const category_health = Array.from(categoryGroups.entries())
    .map(([category, techs]) => {
      const avg_score = Math.round(mean(techs.map((tech) => tech.composite_score)) * 10) / 10
      const avg_momentum = Math.round(mean(techs.map((tech) => tech.momentum)) * 10) / 10
      const bestTech = [...techs].sort((a, b) => b.composite_score - a.composite_score)[0]

      return {
        category,
        label: CATEGORY_LABELS[category],
        count: techs.length,
        avg_score,
        avg_momentum,
        trend_label: trendLabel(avg_momentum),
        best_tech: {
          name: bestTech.name,
          slug: bestTech.slug,
          score: Math.round(bestTech.composite_score),
        },
      }
    })
    .sort((a, b) => b.avg_score - a.avg_score)

  const score_distribution = Array.from({ length: 10 }, (_, index) => ({
    bucket: `${index * 10}–${(index + 1) * 10}`,
    count: merged.filter((tech) => tech.composite_score >= index * 10 && tech.composite_score < (index + 1) * 10).length,
  }))
  if (merged.some((tech) => tech.composite_score === 100)) {
    score_distribution[9].count += merged.filter((tech) => tech.composite_score === 100).length
  }

  const highlights: string[] = []
  if (prevScoreMap.size > 0) {
    const sortedCurrent = [...merged].sort((a, b) => b.composite_score - a.composite_score)
    const sortedPrev = [...merged].sort((a, b) =>
      (prevScoreMap.get(b.technology_id) ?? 0) - (prevScoreMap.get(a.technology_id) ?? 0)
    )

    for (let index = 0; index < Math.min(10, sortedCurrent.length - 1); index += 1) {
      const prevRankA = sortedPrev.findIndex((tech) => tech.technology_id === sortedCurrent[index].technology_id)
      const prevRankB = sortedPrev.findIndex((tech) => tech.technology_id === sortedCurrent[index + 1].technology_id)
      if (prevRankA > prevRankB && prevRankA >= 0 && prevRankB >= 0) {
        highlights.push(`${sortedCurrent[index].name} overtook ${sortedCurrent[index + 1].name} in overall score`)
        break
      }
    }

    const biggestGainer = sortedByDelta[0]
    const biggestLoser = sortedByDelta[sortedByDelta.length - 1]
    if (biggestGainer?.score_delta > 5) {
      highlights.push(`${biggestGainer.name} had the biggest gain this week (+${biggestGainer.score_delta.toFixed(1)} pts)`)
    }
    if (biggestLoser?.score_delta < -5) {
      highlights.push(`${biggestLoser.name} had the sharpest decline this week (${biggestLoser.score_delta.toFixed(1)} pts)`)
    }

    const significantChanges = withDelta.filter((tech) => Math.abs(tech.score_delta) >= 5).length
    if (significantChanges > 0) {
      highlights.push(`${significantChanges} ${significantChanges === 1 ? 'technology' : 'technologies'} saw significant score changes this week`)
    }
  }

  const hottestCategory = [...category_health].sort((a, b) => b.avg_momentum - a.avg_momentum)[0]
  if (hottestCategory?.avg_momentum > 3) {
    highlights.push(`${hottestCategory.label} is the fastest-growing category (avg momentum +${hottestCategory.avg_momentum})`)
  }

  const topScorer = [...merged].sort((a, b) => b.composite_score - a.composite_score)[0]
  if (topScorer && highlights.length < 2) {
    highlights.push(`${topScorer.name} leads all technologies with a score of ${Math.round(topScorer.composite_score)}`)
  }

  const endDate = new Date(lastUpdated)
  const startDate = new Date(lastUpdated)
  startDate.setDate(startDate.getDate() - 6)

  const weekly_digest = {
    highlights: highlights.slice(0, 5),
    period: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    new_techs_added: newTechsResult.data?.length ?? 0,
  }

  const slugToTech = new Map(merged.map((tech) => [tech.slug, tech]))
  const popular_stacks = STACK_TEMPLATES
    .map((stack) => {
      const techs = stack.slugs
        .map((slug) => slugToTech.get(slug))
        .filter((tech): tech is MergedTech => tech != null)
      if (techs.length < 2) return null

      return {
        name: stack.name,
        emoji: stack.emoji,
        description: stack.description,
        technologies: techs.map((tech) => ({
          name: tech.name,
          slug: tech.slug,
          color: tech.color,
          score: Math.round(tech.composite_score),
        })),
        avg_score: Math.round(mean(techs.map((tech) => tech.composite_score))),
      }
    })
    .filter((stack): stack is NonNullable<typeof stack> => stack !== null)

  return {
    market_pulse,
    category_health,
    score_distribution,
    weekly_digest,
    popular_stacks,
    last_updated: lastUpdated,
  }
}

export const getCachedTechnologiesResponse = unstable_cache(
  loadTechnologiesResponse,
  ['technologies-response'],
  { revalidate: 3600 }
)

export const getCachedTechnologyStatsResponse = unstable_cache(
  loadTechStatsResponse,
  ['technology-stats-response'],
  { revalidate: 3600 }
)

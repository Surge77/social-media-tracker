import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { CATEGORY_LABELS } from '@/types'
import type { TechnologyCategory } from '@/types'
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

interface MergedTech {
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

// Hardcoded popular stack combinations — scores resolved dynamically at runtime
const STACK_TEMPLATES = [
  { name: 'Full-Stack Web', emoji: '🎯', description: 'Modern web development', slugs: ['react', 'nodejs', 'typescript', 'postgresql'] },
  { name: 'AI/ML Engineering', emoji: '🤖', description: 'Machine learning & AI', slugs: ['python', 'pytorch', 'tensorflow', 'fastapi'] },
  { name: 'Mobile Development', emoji: '📱', description: 'Cross-platform mobile', slugs: ['react-native', 'typescript', 'firebase'] },
  { name: 'DevOps & Cloud', emoji: '☁️', description: 'Infrastructure & CI/CD', slugs: ['docker', 'kubernetes', 'terraform', 'aws'] },
  { name: 'Backend Heavy', emoji: '⚙️', description: 'Scalable services', slugs: ['go', 'postgresql', 'redis', 'docker'] },
]

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()

    // 1. Canonical score dates (display latest + scoring latest complete)
    const { lastUpdated, scoringDate } = await getCanonicalScoringDate(supabase)
    if (!lastUpdated) {
      return Response.json({ error: 'No score data available yet' }, { status: 404 })
    }
    const activeScoringDate = scoringDate ?? lastUpdated

    // 3. Find nearest comparison date at least 7 days before scoringDate with complete data
    const targetPrevDate = getTargetDateDaysAgo(activeScoringDate, 7)
    const previousDate = await getNearestDateAtOrBefore(supabase, targetPrevDate, true)

    // 4. Run all queries in parallel
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

    if (techResult.error) throw new Error(techResult.error.message)
    const technologies = techResult.data ?? []

    // 5. Build lookup maps
    const scoreMap = new Map<string, { composite_score: number; jobs_score: number | null; community_score: number | null; github_score: number | null; ecosystem_score: number | null; momentum: number }>()
    for (const s of (latestScoresResult.data ?? [])) {
      scoreMap.set(s.technology_id, {
        composite_score: Number(s.composite_score ?? 0),
        jobs_score: s.jobs_score != null ? Number(s.jobs_score) : null,
        community_score: s.community_score != null ? Number(s.community_score) : null,
        github_score: s.github_score != null ? Number(s.github_score) : null,
        ecosystem_score: s.ecosystem_score != null ? Number(s.ecosystem_score) : null,
        momentum: Number(s.momentum ?? 0),
      })
    }

    const prevScoreMap = new Map<string, number>()
    const prevJobsMap = new Map<string, number | null>()
    for (const s of (previousScoresResult.data ?? [])) {
      prevScoreMap.set(s.technology_id, Number(s.composite_score ?? 0))
      prevJobsMap.set(
        s.technology_id,
        s.jobs_score != null ? Number(s.jobs_score) : null
      )
    }

    // 6. Merge technologies with scores
    const merged: MergedTech[] = technologies
      .map((tech) => {
        const scores = scoreMap.get(tech.id)
        if (!scores) return null
        return {
          technology_id: tech.id,
          slug: tech.slug as string,
          name: tech.name as string,
          category: tech.category as TechnologyCategory,
          color: tech.color as string,
          composite_score: scores.composite_score,
          jobs_score: scores.jobs_score,
          community_score: scores.community_score,
          github_score: scores.github_score,
          ecosystem_score: scores.ecosystem_score,
          momentum: scores.momentum,
        }
      })
      .filter((t): t is MergedTech => t !== null)

    if (merged.length === 0) {
      return Response.json({ error: 'No scored technologies found' }, { status: 404 })
    }

    // 7. Compute score deltas
    const withDelta = merged.map((t) => ({
      ...t,
      score_delta: t.composite_score - (prevScoreMap.get(t.technology_id) ?? t.composite_score),
      jobs_delta: (() => {
        const prevJobs = prevJobsMap.get(t.technology_id)
        if (prevJobs == null || t.jobs_score == null) return null
        return t.jobs_score - prevJobs
      })(),
    }))
    const comparableDelta = withDelta.filter((t) => prevScoreMap.has(t.technology_id))
    const sortedByDelta = [...comparableDelta].sort((a, b) => b.score_delta - a.score_delta)

    // 8. Market Pulse
    const sortedByMomentum = [...merged].sort((a, b) => b.momentum - a.momentum)

    // Use delta-based hottest/cooling only when we have comparable previous scores
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
    // Cooling: always the worst performer — most negative delta (or smallest gain) if prev data exists,
    // otherwise the lowest-momentum tech. Skip if same as hottest (edge case when all scores are flat).
    const coolingEntry = selectCoolingEntry(pulseSource, {
      hasPreviousData: hasPrevData,
      excludeTechnologyIds: usedTechnologyIds,
    })
    if (coolingEntry) usedTechnologyIds.add(coolingEntry.technology_id)

    const hottestDelta = hottestEntry
      ? Math.round((hasPrevData ? (withDelta.find(t => t.technology_id === hottestEntry.technology_id)?.score_delta ?? 0) : hottestEntry.momentum / 10) * 10) / 10
      : 0
    const coolingDelta = coolingEntry
      ? Math.round((hasPrevData ? (withDelta.find(t => t.technology_id === coolingEntry.technology_id)?.score_delta ?? 0) : coolingEntry.momentum / 10) * 10) / 10
      : 0

    const hiddenGem = selectHiddenGemEntry(withDelta, {
      excludeTechnologyIds: usedTechnologyIds,
    })
    if (hiddenGem) usedTechnologyIds.add(hiddenGem.technology_id)

    const trending = sortedByMomentum.slice(0, 3)

    const safestBet = selectTopScoreEntry(
      merged.filter((t) => Math.abs(t.momentum) < 5),
      { excludeTechnologyIds: usedTechnologyIds }
    )
    const withDeltaById = new Map(
      withDelta.map((entry) => [entry.technology_id, entry])
    )

    const market_pulse = {
      hottest: hottestEntry
        ? {
            name: hottestEntry.name,
            slug: hottestEntry.slug,
            color: hottestEntry.color,
            composite_score: Math.round(hottestEntry.composite_score),
            score_delta: hottestDelta,
          }
        : null,
      most_demanded: topScore
        ? {
            name: topScore.name,
            slug: topScore.slug,
            color: topScore.color,
            composite_score: Math.round(topScore.composite_score),
            score_delta:
              withDeltaById.get(topScore.technology_id) != null
                ? Math.round((withDeltaById.get(topScore.technology_id)!.score_delta ?? 0) * 10) / 10
                : null,
          }
        : null,
      cooling: coolingEntry
        ? {
            name: coolingEntry.name,
            slug: coolingEntry.slug,
            color: coolingEntry.color,
            composite_score: Math.round(coolingEntry.composite_score),
            score_delta: coolingDelta,
          }
        : null,
      hidden_gem: hiddenGem
        ? {
            name: hiddenGem.name,
            slug: hiddenGem.slug,
            color: hiddenGem.color,
            composite_score: Math.round(hiddenGem.composite_score),
            score_delta:
              withDeltaById.get(hiddenGem.technology_id) != null
                ? Math.round((withDeltaById.get(hiddenGem.technology_id)!.score_delta ?? 0) * 10) / 10
                : null,
          }
        : null,
      trending: trending.map((t) => ({ name: t.name, slug: t.slug, color: t.color, momentum: Math.round(t.momentum * 10) / 10 })),
      safest_bet: safestBet
        ? {
            name: safestBet.name,
            slug: safestBet.slug,
            color: safestBet.color,
            composite_score: Math.round(safestBet.composite_score),
            score_delta:
              withDeltaById.get(safestBet.technology_id) != null
                ? Math.round((withDeltaById.get(safestBet.technology_id)!.score_delta ?? 0) * 10) / 10
                : null,
          }
        : null,
    }

    // 9. Category Health
    const categoryGroups = new Map<TechnologyCategory, MergedTech[]>()
    for (const tech of merged) {
      if (!categoryGroups.has(tech.category)) categoryGroups.set(tech.category, [])
      categoryGroups.get(tech.category)!.push(tech)
    }

    const category_health = Array.from(categoryGroups.entries()).map(([cat, techs]) => {
      const avgScore = Math.round(mean(techs.map((t) => t.composite_score ?? 0)) * 10) / 10
      const avgMomentum = Math.round(mean(techs.map((t) => t.momentum ?? 0)) * 10) / 10
      const bestTech = [...techs].sort((a, b) => b.composite_score - a.composite_score)[0]
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        count: techs.length,
        avg_score: avgScore,
        avg_momentum: avgMomentum,
        trend_label: trendLabel(avgMomentum),
        best_tech: { name: bestTech.name, slug: bestTech.slug, score: Math.round(bestTech.composite_score) },
      }
    }).sort((a, b) => b.avg_score - a.avg_score)

    // 10. Score Distribution (10 buckets: 0-10, 10-20, ..., 90-100)
    const score_distribution = Array.from({ length: 10 }, (_, i) => ({
      bucket: `${i * 10}–${(i + 1) * 10}`,
      count: merged.filter((t) =>
        t.composite_score >= i * 10 && t.composite_score < (i + 1) * 10
      ).length,
    }))
    // Edge case: score exactly 100 goes in the last bucket
    if (merged.some((t) => t.composite_score === 100)) {
      score_distribution[9].count += merged.filter((t) => t.composite_score === 100).length
    }

    // 11. Weekly Digest
    const highlights: string[] = []

    if (prevScoreMap.size > 0) {
      // Rank overtakes
      const sortedCurrent = [...merged].sort((a, b) => b.composite_score - a.composite_score)
      const sortedPrev = [...merged].sort((a, b) =>
        (prevScoreMap.get(b.technology_id) ?? 0) - (prevScoreMap.get(a.technology_id) ?? 0)
      )
      for (let i = 0; i < Math.min(10, sortedCurrent.length - 1); i++) {
        const prevRankA = sortedPrev.findIndex((t) => t.technology_id === sortedCurrent[i].technology_id)
        const prevRankB = sortedPrev.findIndex((t) => t.technology_id === sortedCurrent[i + 1].technology_id)
        if (prevRankA > prevRankB && prevRankA >= 0 && prevRankB >= 0) {
          highlights.push(`${sortedCurrent[i].name} overtook ${sortedCurrent[i + 1].name} in overall score`)
          break
        }
      }

      // Biggest weekly mover
      const biggestGainer = sortedByDelta[0]
      const biggestLoser = sortedByDelta[sortedByDelta.length - 1]
      if (biggestGainer?.score_delta > 5) {
        highlights.push(`${biggestGainer.name} had the biggest gain this week (+${biggestGainer.score_delta.toFixed(1)} pts)`)
      }
      if (biggestLoser?.score_delta < -5) {
        highlights.push(`${biggestLoser.name} had the sharpest decline this week (${biggestLoser.score_delta.toFixed(1)} pts)`)
      }

      // Significant changes count
      const sigChanges = withDelta.filter((t) => Math.abs(t.score_delta) >= 5).length
      if (sigChanges > 0) {
        highlights.push(`${sigChanges} ${sigChanges === 1 ? 'technology' : 'technologies'} saw significant score changes this week`)
      }
    }

    // Hottest category (always available)
    const hottestCategory = [...category_health].sort((a, b) => b.avg_momentum - a.avg_momentum)[0]
    if (hottestCategory?.avg_momentum > 3) {
      highlights.push(`${hottestCategory.label} is the fastest-growing category (avg momentum +${hottestCategory.avg_momentum})`)
    }

    // Top scorer (always available as a fallback highlight)
    const topScorer = [...merged].sort((a, b) => b.composite_score - a.composite_score)[0]
    if (topScorer && highlights.length < 2) {
      highlights.push(`${topScorer.name} leads all technologies with a score of ${Math.round(topScorer.composite_score)}`)
    }

    // Period label
    const endDate = new Date(lastUpdated)
    const startDate = new Date(lastUpdated)
    startDate.setDate(startDate.getDate() - 6)
    const periodLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    const weekly_digest = {
      highlights: highlights.slice(0, 5),
      period: periodLabel,
      new_techs_added: newTechsResult.data?.length ?? 0,
    }

    // 12. Popular Stacks (dynamic scores)
    const slugToTech = new Map(merged.map((t) => [t.slug, t]))

    const popular_stacks = STACK_TEMPLATES.map((stack) => {
      const techs = stack.slugs
        .map((slug) => slugToTech.get(slug))
        .filter((t): t is MergedTech => t != null)
      if (techs.length < 2) return null
      const avgScore = Math.round(mean(techs.map((t) => t.composite_score)))
      return {
        name: stack.name,
        emoji: stack.emoji,
        description: stack.description,
        technologies: techs.map((t) => ({
          name: t.name,
          slug: t.slug,
          color: t.color,
          score: Math.round(t.composite_score),
        })),
        avg_score: avgScore,
      }
    }).filter((s): s is NonNullable<typeof s> => s !== null)

    return Response.json(
      {
        market_pulse,
        category_health,
        score_distribution,
        weekly_digest,
        popular_stacks,
        last_updated: lastUpdated,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}

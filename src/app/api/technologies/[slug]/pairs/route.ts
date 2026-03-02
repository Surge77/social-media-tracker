import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'
import { scorePair, reweightForCareer, reweightForStack } from '@/lib/scoring/pair-scoring'
import { getCanonicalScoringDate } from '@/lib/scoring/scoring-date'

/**
 * GET /api/technologies/[slug]/pairs?mode=career|stack&limit=6
 *
 * Returns top N paired technologies ranked by pair score.
 * Derived from daily_scores subscores — no AI call, fast.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('mode') === 'stack' ? 'stack' : 'career'
  const limit = Math.min(12, parseInt(searchParams.get('limit') ?? '6', 10))

  const supabase = createSupabaseAdminClient()
  const { scoringDate } = await getCanonicalScoringDate(supabase)

  const { data: technology } = await supabase
    .from('technologies')
    .select('id, slug, name, category')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!technology) {
    return Response.json({ error: 'Technology not found' }, { status: 404 })
  }

  const { data: allTechs } = await supabase
    .from('technologies')
    .select('id, slug, name, category')
    .eq('is_active', true)
    .neq('slug', slug)

  if (!allTechs || allTechs.length === 0) {
    return Response.json({ pairs: [], mode, method_version: '1.0' })
  }

  const allTechIds = [technology.id, ...allTechs.map((t) => t.id)]

  const scoresQuery = supabase
    .from('daily_scores')
    .select(
      'technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum, data_completeness'
    )
    .in('technology_id', allTechIds)

  const { data: allScores } = scoringDate
    ? await scoresQuery.eq('score_date', scoringDate)
    : await scoresQuery.order('score_date', { ascending: false }).limit(allTechIds.length)

  if (!allScores || allScores.length === 0) {
    return Response.json({ pairs: [], mode, method_version: '1.0' })
  }

  const scoreMap = new Map<string, typeof allScores[0]>()
  for (const s of allScores) {
    if (!scoreMap.has(s.technology_id)) scoreMap.set(s.technology_id, s)
  }

  const baseRaw = scoreMap.get(technology.id)
  if (!baseRaw) {
    return Response.json({ pairs: [], mode, method_version: '1.0' })
  }

  const toNum = (v: unknown): number | null =>
    v !== null && v !== undefined ? Number(v) : null

  const baseScore = {
    slug: technology.slug,
    composite_score: toNum(baseRaw.composite_score),
    github_score: toNum(baseRaw.github_score),
    community_score: toNum(baseRaw.community_score),
    jobs_score: toNum(baseRaw.jobs_score),
    ecosystem_score: toNum(baseRaw.ecosystem_score),
    momentum: toNum(baseRaw.momentum),
    data_completeness: toNum(baseRaw.data_completeness),
  }

  const pairs = allTechs
    .map((tech) => {
      const raw = scoreMap.get(tech.id)
      if (!raw) return null
      const candidate = {
        slug: tech.slug,
        composite_score: toNum(raw.composite_score),
        github_score: toNum(raw.github_score),
        community_score: toNum(raw.community_score),
        jobs_score: toNum(raw.jobs_score),
        ecosystem_score: toNum(raw.ecosystem_score),
        momentum: toNum(raw.momentum),
        data_completeness: toNum(raw.data_completeness),
      }
      let scored = scorePair(baseScore, candidate)
      if (mode === 'career') scored = reweightForCareer(scored)
      else scored = reweightForStack(scored)
      return { tech, scored }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.scored.pairScore - a.scored.pairScore)
    .slice(0, limit)

  const result = pairs.map(({ tech, scored }) => ({
    slug: tech.slug,
    name: tech.name,
    category: tech.category,
    pairScore: scored.pairScore,
    pairConfidence: scored.pairConfidence,
    compatibility: scored.compatibility,
    whyPair: scored.whyPair,
    riskFlags: scored.riskFlags,
  }))

  return Response.json({ pairs: result, mode, method_version: '1.0' })
}

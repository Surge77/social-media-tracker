import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { resilientAICall } from '@/lib/ai/resilient-call'
import { generateStackAnalysis } from '@/lib/ai/generators/stack-analysis'
import type { CandidateTech, StackAnalysisResult } from '@/lib/ai/generators/stack-analysis'
import type { TechnologyCategory } from '@/types'

/**
 * GET /api/technologies/[slug]/stack
 *
 * Returns an AI-generated "Often Used Together" stack analysis.
 * Results are cached 30 days in ai_insights (insight_type = 'stack-companions').
 */

const CACHE_TTL_DAYS = 30

/** Which categories contain natural complements for each tech category */
const COMPLEMENT_CATEGORIES: Record<string, TechnologyCategory[]> = {
  frontend:   ['language', 'backend', 'devops', 'database', 'frontend'],
  backend:    ['database', 'language', 'devops', 'cloud', 'frontend'],
  database:   ['backend', 'devops', 'cloud', 'language'],
  language:   ['frontend', 'backend', 'database', 'devops', 'cloud', 'mobile', 'ai_ml'],
  devops:     ['cloud', 'backend', 'language'],
  cloud:      ['devops', 'backend', 'database'],
  mobile:     ['language', 'backend', 'cloud'],
  ai_ml:      ['language', 'database', 'backend', 'cloud'],
  blockchain: ['backend', 'database', 'devops'],
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseAdminClient()

    // 1. Fetch the technology by slug (404 if not found or inactive)
    const { data: technology } = await supabase
      .from('technologies')
      .select('id, slug, name, category, description')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (!technology) {
      return NextResponse.json({ error: 'Technology not found' }, { status: 404 })
    }

    // 2. Check cache in ai_insights (30-day TTL)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - CACHE_TTL_DAYS)

    const { data: cached } = await supabase
      .from('ai_insights')
      .select('content, generated_at')
      .eq('technology_id', technology.id)
      .eq('insight_type', 'stack-companions')
      .gte('generated_at', cutoff.toISOString())
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let analysis: StackAnalysisResult | null = null

    // 3. Cache hit: parse content as { companions, stackSummary }
    if (cached?.content) {
      try {
        const parsed = cached.content as Record<string, unknown>
        const companions = (parsed.companions as StackAnalysisResult['companions']) ?? []
        const stackSummary = typeof parsed.stackSummary === 'string' ? parsed.stackSummary : ''
        if (Array.isArray(companions) && companions.length > 0) {
          analysis = { companions, stackSummary }
        }
      } catch {
        // Cache corrupted — regenerate below
      }
    }

    // 4. Cache miss: fetch up to 80 active techs, call AI
    if (!analysis) {
      const complementCategories =
        COMPLEMENT_CATEGORIES[technology.category] ??
        ['language', 'backend', 'frontend', 'database', 'devops']

      // Fetch latest score date to rank candidates
      const { data: latestScoreDateRow } = await supabase
        .from('daily_scores')
        .select('score_date')
        .order('score_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      let candidates: CandidateTech[] = []

      if (latestScoreDateRow) {
        const { data: techsInCategories } = await supabase
          .from('technologies')
          .select('id, slug, name, category, description')
          .in('category', complementCategories)
          .eq('is_active', true)
          .neq('id', technology.id)
          .limit(80)

        if (techsInCategories && techsInCategories.length > 0) {
          const ids = techsInCategories.map((t) => t.id)

          const { data: scores } = await supabase
            .from('daily_scores')
            .select('technology_id, composite_score')
            .in('technology_id', ids)
            .eq('score_date', latestScoreDateRow.score_date)

          const scoreMap = new Map<string, number>()
          for (const s of scores ?? []) {
            scoreMap.set(s.technology_id, Number(s.composite_score))
          }

          const slugToId = new Map<string, string>(
            techsInCategories.map((t) => [t.slug, t.id])
          )

          candidates = techsInCategories
            .map((t) => ({
              slug: t.slug,
              name: t.name,
              category: t.category,
              description: t.description,
            }))
            .sort((a, b) => {
              const idA = slugToId.get(a.slug) ?? ''
              const idB = slugToId.get(b.slug) ?? ''
              return (scoreMap.get(idB) ?? 0) - (scoreMap.get(idA) ?? 0)
            })
            .slice(0, 80) // up to 80 candidates
        }
      }

      if (candidates.length === 0) {
        return NextResponse.json({ stack: [], stackSummary: null })
      }

      // Call AI via resilientAICall
      const keyManager = createKeyManager()
      try {
        analysis = await resilientAICall(
          'stack-analysis',
          (provider) =>
            generateStackAnalysis(
              {
                slug: technology.slug,
                name: technology.name,
                category: technology.category,
                description: technology.description,
              },
              candidates,
              provider
            ),
          keyManager
        )

        // Validate: remove any slugs the AI hallucinated
        const validSlugs = new Set(candidates.map((c) => c.slug))
        analysis.companions = analysis.companions.filter((c) => validSlugs.has(c.slug))

        // Upsert to ai_insights
        await supabase.from('ai_insights').upsert(
          {
            technology_id: technology.id,
            insight_type: 'stack-companions',
            content: analysis as unknown as Record<string, unknown>,
            model_used: 'gemini',
            generated_at: new Date().toISOString(),
          },
          { onConflict: 'technology_id,insight_type' }
        )
      } catch (aiErr) {
        console.error('[stack-companions] AI failed:', aiErr)
        // On AI failure return empty
        return NextResponse.json({ stack: [], stackSummary: null })
      }
    }

    if (!analysis || analysis.companions.length === 0) {
      return NextResponse.json({ stack: [], stackSummary: null })
    }

    // 5. Enrich companion entries with live scores
    // Step A: fetch tech metadata + latest score date in parallel
    const companionSlugs = analysis.companions.map((c) => c.slug)

    const [techsResult, latestScoreDateResult] = await Promise.all([
      supabase
        .from('technologies')
        .select('id, slug, name, color, category, description')
        .in('slug', companionSlugs)
        .eq('is_active', true),
      supabase
        .from('daily_scores')
        .select('score_date')
        .order('score_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    const techs = techsResult.data ?? []
    const techMap = new Map(techs.map((t) => [t.slug, t]))
    const techIds = techs.map((t) => t.id)

    // Step B: fetch daily_scores using IDs obtained from Step A
    const scoreMap = new Map<string, { composite_score: number; momentum: number }>()
    if (latestScoreDateResult.data && techIds.length > 0) {
      const { data: scores } = await supabase
        .from('daily_scores')
        .select('technology_id, composite_score, momentum')
        .in('technology_id', techIds)
        .eq('score_date', latestScoreDateResult.data.score_date)
        .limit(techIds.length * 2)

      for (const s of scores ?? []) {
        scoreMap.set(s.technology_id, {
          composite_score: Number(s.composite_score),
          momentum: Number(s.momentum),
        })
      }
    }

    // 6. Build final stack preserving AI order
    const stack = analysis.companions
      .map((companion) => {
        const tech = techMap.get(companion.slug)
        if (!tech) return null
        const score = scoreMap.get(tech.id)
        return {
          slug: tech.slug,
          name: tech.name,
          color: tech.color,
          category: tech.category,
          description: tech.description,
          composite_score: score?.composite_score ?? null,
          momentum: score?.momentum ?? null,
          reason: companion.reason,
          pairingStrength: companion.pairingStrength,
        }
      })
      .filter(Boolean)

    return NextResponse.json({
      stack,
      stackSummary: analysis.stackSummary ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

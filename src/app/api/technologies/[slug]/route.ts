import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * GET /api/technologies/[slug]
 *
 * Returns detailed view of a single technology:
 * - Technology info
 * - Current scores
 * - 90-day chart data
 * - Latest signals from all sources
 * - Related technologies (same category, top 6)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseAdminClient()

    // Fetch the technology first — need id/category for the parallel queries below
    const { data: technology, error: techError } = await supabase
      .from('technologies')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (techError || !technology) {
      return Response.json({ error: 'Technology not found' }, { status: 404 })
    }

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Run all independent queries in parallel
    const [currentScoresResult, chartResult, signalsResult, relatedTechsResult] = await Promise.all([
      // Most recent score row
      supabase
        .from('daily_scores')
        .select('*')
        .eq('technology_id', technology.id)
        .order('score_date', { ascending: false })
        .limit(1)
        .single(),

      // 90-day chart
      supabase
        .from('daily_scores')
        .select('score_date, composite_score, github_score, community_score, jobs_score, ecosystem_score')
        .eq('technology_id', technology.id)
        .gte('score_date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('score_date', { ascending: true }),

      // Latest signals from data_points_latest (indexed single-row lookup per metric)
      supabase
        .from('data_points_latest')
        .select('source, metric, value')
        .eq('technology_id', technology.id),

      // Related techs in same category
      supabase
        .from('technologies')
        .select('id, slug, name, color')
        .eq('category', technology.category)
        .eq('is_active', true)
        .neq('id', technology.id),
    ])

    const currentScores = currentScoresResult.data
    const chartRows = chartResult.data ?? []
    const dataPoints = signalsResult.data ?? []
    const relatedTechs = relatedTechsResult.data ?? []

    const chart_data = chartRows.map((row) => ({
      date: row.score_date,
      composite: Number(row.composite_score),
      github: Number(row.github_score ?? 0),
      community: Number(row.community_score ?? 0),
      jobs: Number(row.jobs_score ?? 0),
      ecosystem: Number(row.ecosystem_score ?? 0),
    }))

    const latest_signals = buildLatestSignals(dataPoints)

    // Fetch related tech scores (depends on relatedTechs result above)
    const relatedWithScores: Array<{ slug: string; name: string; color: string; composite_score: number }> = []

    if (relatedTechs.length > 0 && currentScores) {
      const relatedIds = relatedTechs.map((t) => t.id)
      const { data: relatedScores } = await supabase
        .from('daily_scores')
        .select('technology_id, composite_score')
        .in('technology_id', relatedIds)
        .eq('score_date', currentScores.score_date)

      const relatedScoreMap = new Map<string, number>()
      if (relatedScores) {
        for (const s of relatedScores) {
          relatedScoreMap.set(s.technology_id, Number(s.composite_score))
        }
      }

      for (const t of relatedTechs) {
        relatedWithScores.push({
          slug: t.slug,
          name: t.name,
          color: t.color,
          composite_score: relatedScoreMap.get(t.id) ?? 0,
        })
      }

      relatedWithScores.sort((a, b) => b.composite_score - a.composite_score)
    }

    return Response.json({
      technology: {
        id: technology.id,
        slug: technology.slug,
        name: technology.name,
        description: technology.description,
        category: technology.category,
        ecosystem: technology.ecosystem,
        color: technology.color,
        website_url: technology.website_url,
        github_repo: technology.github_repo,
        npm_package: technology.npm_package,
        stackoverflow_tag: technology.stackoverflow_tag,
        first_appeared: technology.first_appeared,
        maintained_by: technology.maintained_by,
      },
      current_scores: currentScores
        ? {
            composite_score: Number(currentScores.composite_score),
            github_score: Number(currentScores.github_score),
            community_score: Number(currentScores.community_score),
            jobs_score: Number(currentScores.jobs_score),
            ecosystem_score: Number(currentScores.ecosystem_score),
            momentum: Number(currentScores.momentum),
            data_completeness: Number(currentScores.data_completeness),
            raw_sub_scores: currentScores.raw_sub_scores,
          }
        : null,
      chart_data,
      latest_signals,
      related_technologies: relatedWithScores.slice(0, 6),
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}

function buildLatestSignals(
  dataPoints: Array<{ source: string; metric: string; value: number }>
) {
  // O(1) lookup via Map instead of repeated .find() calls
  const dpMap = new Map<string, number>()
  for (const dp of dataPoints) {
    dpMap.set(`${dp.source}:${dp.metric}`, Number(dp.value))
  }
  const get = (source: string, metric: string): number | null =>
    dpMap.get(`${source}:${metric}`) ?? null

  const stars = get('github', 'stars')
  const forks = get('github', 'forks')
  const openIssues = get('github', 'open_issues')

  const hnMentions = get('hackernews', 'mentions')
  const hnUpvotes = get('hackernews', 'upvotes')
  const hnSentiment = get('hackernews', 'sentiment')

  const soQuestions = get('stackoverflow', 'questions')
  const soMentions = get('stackoverflow', 'mentions')

  const npmDownloads = get('npm', 'downloads')

  const redditPosts = get('reddit', 'posts')
  const redditUpvotes = get('reddit', 'upvotes')
  const redditSentiment = get('reddit', 'sentiment')

  const devtoArticles = get('devto', 'articles')
  const devtoUpvotes = get('devto', 'upvotes')

  const adzunaJobs = get('adzuna', 'job_postings')
  const jsearchJobs = get('jsearch', 'job_postings')
  const remotiveJobs = get('remotive', 'job_postings')

  return {
    github:
      stars !== null || forks !== null
        ? { stars: stars ?? 0, forks: forks ?? 0, open_issues: openIssues ?? 0 }
        : null,
    hackernews:
      hnMentions !== null
        ? {
            mentions: hnMentions,
            avg_upvotes: hnUpvotes ?? 0,
            sentiment: hnSentiment ?? 0.5,
            top_stories: [],
          }
        : null,
    stackoverflow:
      soQuestions !== null || soMentions !== null
        ? { questions_30d: soQuestions ?? 0, total_questions: soMentions ?? 0 }
        : null,
    npm: npmDownloads !== null ? { weekly_downloads: npmDownloads } : null,
    reddit:
      redditPosts !== null
        ? {
            posts: redditPosts,
            avg_upvotes: redditUpvotes ?? 0,
            sentiment: redditSentiment ?? 0.5,
          }
        : null,
    devto:
      devtoArticles !== null
        ? { articles: devtoArticles, reactions: devtoUpvotes ?? 0 }
        : null,
    jobs:
      adzunaJobs !== null || jsearchJobs !== null || remotiveJobs !== null
        ? {
            adzuna: adzunaJobs ?? 0,
            jsearch: jsearchJobs ?? 0,
            remotive: remotiveJobs ?? 0,
            total: (adzunaJobs ?? 0) + (jsearchJobs ?? 0) + (remotiveJobs ?? 0),
          }
        : null,
  }
}

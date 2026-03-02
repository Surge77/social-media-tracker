import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'
import {
  getCanonicalScoringDate,
  getTargetDateDaysAgo,
} from '@/lib/scoring/scoring-date'
import { computeDecisionSummary, computeWhatChanged } from '@/lib/insights'

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
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseAdminClient()
    const { scoringDate } = await getCanonicalScoringDate(supabase)

    // Fetch the technology first - need id/category for the parallel queries below
    const { data: technology, error: techError } = await supabase
      .from('technologies')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (techError || !technology) {
      return Response.json({ error: 'Technology not found' }, { status: 404 })
    }

    const chartStartDate = getTargetDateDaysAgo(scoringDate ?? new Date().toISOString().split('T')[0], 90)

    const currentScoresQuery = supabase
      .from('daily_scores')
      .select('*')
      .eq('technology_id', technology.id)
      .order('score_date', { ascending: false })
      .limit(1)

    const chartQuery = supabase
      .from('daily_scores')
      .select('score_date, composite_score, github_score, community_score, jobs_score, ecosystem_score')
      .eq('technology_id', technology.id)
      .gte('score_date', chartStartDate)
      .order('score_date', { ascending: true })

    // Run all independent queries in parallel
    const [currentScoresResult, chartResult, signalsResult, relatedTechsResult] = await Promise.all([
      (scoringDate
        ? currentScoresQuery.eq('score_date', scoringDate)
        : currentScoresQuery
      ).maybeSingle(),
      scoringDate ? chartQuery.lte('score_date', scoringDate) : chartQuery,
      supabase
        .from('data_points_latest')
        .select('source, metric, value, metadata')
        .eq('technology_id', technology.id),
      supabase
        .from('technologies')
        .select('id, slug, name, color')
        .eq('category', technology.category)
        .eq('is_active', true)
        .neq('id', technology.id),
    ])

    const currentScores = currentScoresResult.data
    const chartRows = chartResult.data ?? []
    const relatedTechs = relatedTechsResult.data ?? []
    let dataPoints = signalsResult.data ?? []

    // Supplement with latest job data from data_points if data_points_latest lacks it.
    const hasJobSignals = dataPoints.some((dp) => dp.metric === 'job_postings')
    if (!hasJobSignals) {
      const { data: latestJobs } = await supabase
        .from('data_points')
        .select('source, metric, value, metadata')
        .eq('technology_id', technology.id)
        .eq('metric', 'job_postings')
        .order('measured_at', { ascending: false })
        .limit(10)

      if (latestJobs && latestJobs.length > 0) {
        const seenSources = new Set<string>()
        for (const dp of latestJobs) {
          if (!seenSources.has(dp.source)) {
            dataPoints.push(dp)
            seenSources.add(dp.source)
          }
        }
      }
    }

    const chart_data = chartRows.map((row) => ({
      date: row.score_date,
      composite: Number(row.composite_score),
      github: row.github_score !== null ? Number(row.github_score) : null,
      community: row.community_score !== null ? Number(row.community_score) : null,
      jobs: row.jobs_score !== null ? Number(row.jobs_score) : null,
      ecosystem: row.ecosystem_score !== null ? Number(row.ecosystem_score) : null,
    }))

    const latest_signals = buildLatestSignals(dataPoints)

    // Compute global rank and dimension percentiles for this tech
    let rank: number | null = null
    let totalRanked: number | null = null
    let dimensionPercentiles: { github: number | null; community: number | null; jobs: number | null; ecosystem: number | null } | null = null

    if (currentScores) {
      const { data: allScoresOnDate } = await supabase
        .from('daily_scores')
        .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score')
        .eq('score_date', currentScores.score_date)
        .not('composite_score', 'is', null)
        .order('composite_score', { ascending: false })

      if (allScoresOnDate && allScoresOnDate.length > 0) {
        totalRanked = allScoresOnDate.length
        const rankIdx = allScoresOnDate.findIndex((s) => s.technology_id === technology.id)
        rank = rankIdx >= 0 ? rankIdx + 1 : null

        const computeDimPct = (
          myScore: number | null,
          allRows: typeof allScoresOnDate,
          field: keyof typeof allScoresOnDate[0]
        ) => {
          if (myScore === null) return null
          const allValues = allRows
            .map((r) => r[field])
            .filter((v): v is number => v !== null)
            .map((v) => Number(v))
            .filter((v) => !Number.isNaN(v))
          if (allValues.length === 0) return null
          const below = allValues.filter((v) => v < myScore).length
          return Math.round((below / allValues.length) * 100)
        }

        dimensionPercentiles = {
          github: computeDimPct(currentScores.github_score !== null ? Number(currentScores.github_score) : null, allScoresOnDate, 'github_score'),
          community: computeDimPct(currentScores.community_score !== null ? Number(currentScores.community_score) : null, allScoresOnDate, 'community_score'),
          jobs: computeDimPct(currentScores.jobs_score !== null ? Number(currentScores.jobs_score) : null, allScoresOnDate, 'jobs_score'),
          ecosystem: computeDimPct(currentScores.ecosystem_score !== null ? Number(currentScores.ecosystem_score) : null, allScoresOnDate, 'ecosystem_score'),
        }
      }
    }

    // Fetch related tech scores
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

    // Extract confidence grade for decision summary
    const rawSubForDecision = currentScores?.raw_sub_scores as Record<string, unknown> | null | undefined
    const confidenceGradeForDecision = (() => {
      if (!rawSubForDecision) return null
      const conf = rawSubForDecision.confidence as any
      return typeof conf?.grade === 'string' ? conf.grade : null
    })()

    const decision_summary = currentScores
      ? computeDecisionSummary(
          Number(currentScores.composite_score),
          Number(currentScores.momentum),
          currentScores.jobs_score !== null ? Number(currentScores.jobs_score) : null,
          currentScores.github_score !== null ? Number(currentScores.github_score) : null,
          currentScores.community_score !== null ? Number(currentScores.community_score) : null,
          currentScores.ecosystem_score !== null ? Number(currentScores.ecosystem_score) : null,
          Number(currentScores.data_completeness),
          confidenceGradeForDecision
        )
      : null

    const what_changed = computeWhatChanged(chart_data)

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
          github_score: currentScores.github_score !== null ? Number(currentScores.github_score) : null,
          community_score: currentScores.community_score !== null ? Number(currentScores.community_score) : null,
          jobs_score: currentScores.jobs_score !== null ? Number(currentScores.jobs_score) : null,
          ecosystem_score: currentScores.ecosystem_score !== null ? Number(currentScores.ecosystem_score) : null,
          onchain_score: currentScores.onchain_score !== null ? Number(currentScores.onchain_score) : null,
          momentum: Number(currentScores.momentum),
          data_completeness: Number(currentScores.data_completeness),
          raw_sub_scores: currentScores.raw_sub_scores,
        }
        : null,
      current_scores_meta: currentScores
        ? {
          is_complete: currentScores.jobs_score !== null,
          scoring_date: currentScores.score_date,
          missing_dimensions: [
            currentScores.github_score === null ? 'github' : null,
            currentScores.community_score === null ? 'community' : null,
            currentScores.jobs_score === null ? 'jobs' : null,
            currentScores.ecosystem_score === null ? 'ecosystem' : null,
            technology.category === 'blockchain' && currentScores.onchain_score === null ? 'onchain' : null,
          ].filter((v): v is string => v !== null),
        }
        : null,
      chart_data,
      latest_signals,
      related_technologies: relatedWithScores.slice(0, 6),
      rank,
      total_ranked: totalRanked,
      dimension_percentiles: dimensionPercentiles,
      decision_summary,
      what_changed,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}

function buildLatestSignals(
  dataPoints: Array<{ source: string; metric: string; value: number; metadata?: Record<string, unknown> | null }>
) {
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

  const ytVideoCount = get('youtube', 'yt_video_count')
  const ytTotalViews = get('youtube', 'yt_total_views')
  const ytAvgLikes = get('youtube', 'yt_avg_likes')
  const ytUploadVelocity = get('youtube', 'yt_upload_velocity')
  const ytTopVideosDP = dataPoints.find(
    (dp) => dp.source === 'youtube' && dp.metric === 'yt_top_videos'
  )
  const ytTopVideosMeta = ytTopVideosDP?.metadata as
    | { videos?: unknown[]; comparisonVideos?: unknown[] }
    | null
    | undefined

  const youtube = ytVideoCount !== null ? {
    videoCount30d: ytVideoCount,
    totalViews: ytTotalViews ?? 0,
    avgLikes: ytAvgLikes ?? 0,
    uploadVelocity: ytUploadVelocity ?? 0,
    topVideos: [
      ...(ytTopVideosMeta?.videos ?? []),
      ...(ytTopVideosMeta?.comparisonVideos ?? []),
    ],
  } : null

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
    youtube,
  }
}

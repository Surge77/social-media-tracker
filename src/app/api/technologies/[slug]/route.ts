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
      // metadata is needed for YouTube top_videos (actual video objects live there)
      supabase
        .from('data_points_latest')
        .select('source, metric, value, metadata')
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
    let dataPoints = signalsResult.data ?? []
    const relatedTechs = relatedTechsResult.data ?? []

    // Supplement with latest job data from data_points if data_points_latest lacks it.
    // Jobs are fetched weekly and data_points_latest may not have been populated.
    const hasJobSignals = dataPoints.some(dp => dp.metric === 'job_postings')
    if (!hasJobSignals) {
      const { data: latestJobs } = await supabase
        .from('data_points')
        .select('source, metric, value, metadata')
        .eq('technology_id', technology.id)
        .eq('metric', 'job_postings')
        .order('measured_at', { ascending: false })
        .limit(10) // Grab latest from each source

      if (latestJobs && latestJobs.length > 0) {
        // Deduplicate: keep only the most recent entry per source
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
        const rankIdx = allScoresOnDate.findIndex(s => s.technology_id === technology.id)
        rank = rankIdx >= 0 ? rankIdx + 1 : null

        // Dimension percentiles: where does this tech's sub-score rank among all sub-scores?
        const computeDimPct = (myScore: number | null, allRows: typeof allScoresOnDate, field: keyof typeof allScoresOnDate[0]) => {
          if (myScore === null) return null
          const allValues = allRows.map(r => Number(r[field])).filter(v => !isNaN(v) && v !== null)
          if (allValues.length === 0) return null
          const below = allValues.filter(v => v < myScore).length
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
        ? (() => {
          // If jobs_score is null but we have actual job data, compute a quick estimate
          let effectiveJobsScore = currentScores.jobs_score !== null
            ? Number(currentScores.jobs_score)
            : null

          if (effectiveJobsScore === null && latest_signals.jobs && latest_signals.jobs.total > 0) {
            // Quick heuristic: scale total jobs to a 0-100 score
            // This is a temporary estimate until the scoring pipeline runs with the fix
            const totalJobs = latest_signals.jobs.total
            effectiveJobsScore = Math.min(100, Math.round(
              Math.log10(totalJobs + 1) * 25 // logarithmic scale: 1→0, 10→25, 100→50, 1000→75, 10000→100
            ))
          }

          return {
            composite_score: Number(currentScores.composite_score),
            github_score: currentScores.github_score !== null ? Number(currentScores.github_score) : null,
            community_score: currentScores.community_score !== null ? Number(currentScores.community_score) : null,
            jobs_score: effectiveJobsScore,
            ecosystem_score: currentScores.ecosystem_score !== null ? Number(currentScores.ecosystem_score) : null,
            momentum: Number(currentScores.momentum),
            data_completeness: Number(currentScores.data_completeness),
            raw_sub_scores: currentScores.raw_sub_scores,
          }
        })()
        : null,
      chart_data,
      latest_signals,
      related_technologies: relatedWithScores.slice(0, 6),
      rank,
      total_ranked: totalRanked,
      dimension_percentiles: dimensionPercentiles,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}

function buildLatestSignals(
  dataPoints: Array<{ source: string; metric: string; value: number; metadata?: Record<string, unknown> | null }>
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

  // YouTube signals
  const ytVideoCount = get('youtube', 'yt_video_count')
  const ytTotalViews = get('youtube', 'yt_total_views')
  const ytAvgLikes = get('youtube', 'yt_avg_likes')
  const ytUploadVelocity = get('youtube', 'yt_upload_velocity')
  const ytTopVideosDP = dataPoints.find(
    dp => dp.source === 'youtube' && dp.metric === 'yt_top_videos'
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

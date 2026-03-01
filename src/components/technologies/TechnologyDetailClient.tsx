'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, MessageSquare, Briefcase, Package, Link2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAIInsight } from '@/hooks/useAIInsight'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge'
import { LifecycleBadge } from '@/components/shared/LifecycleBadge'
import { DataFreshness } from '@/components/shared/DataFreshness'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import { ScoreBreakdown } from '@/components/technologies/ScoreBreakdown'
import { TechRadarChart } from '@/components/technologies/TechRadarChart'
import { TrendChart } from '@/components/technologies/TrendChart'
import { SourceSignalCard } from '@/components/technologies/SourceSignalCard'
import { RelatedTechnologies } from '@/components/technologies/RelatedTechnologies'
import { StarHistoryChart } from '@/components/technologies/StarHistoryChart'
import { MomentumDetailCard } from '@/components/technologies/MomentumDetailCard'
import { YouTubeSignalsCard } from '@/components/technologies/YouTubeSignalsCard'
import { PackageDownloadsChart } from '@/components/technologies/PackageDownloadsChart'
import { JobMarketChart } from '@/components/technologies/JobMarketChart'
import { AlternativesPanel } from '@/components/technologies/AlternativesPanel'
import { AIInsightCard, AIInsightSkeleton, AIInsightError } from '@/components/ai/AIInsightCard'
import { FeedbackButtons } from '@/components/ai/FeedbackButtons'
import { AnomalyBanner } from '@/components/technologies/AnomalyBanner'
import { Loading } from '@/components/ui/loading'
import { getRecommendation, getMomentumInsight, buildScoreExplainerDimensions } from '@/lib/insights'
import { ScoreExplainer } from '@/components/technologies/ScoreExplainer'
import type { TechnologyDetail } from '@/types'

export function TechnologyDetailClient() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const prefersReducedMotion = useReducedMotion()
  const isScrolled = useScrolled(250)

  const [data, setData] = React.useState<TechnologyDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // AI insight hook — fetches from /api/ai/insights/[slug]
  const ai = useAIInsight(slug ?? null)

  React.useEffect(() => {
    if (!slug) return

    async function fetchTechnology() {
      try {
        const response = await fetch(`/api/technologies/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Technology not found')
          } else {
            throw new Error('Failed to fetch technology')
          }
          setIsLoading(false)
          return
        }

        const result = await response.json()
        setData(result)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    }

    fetchTechnology()
  }, [slug])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <Loading size="lg" text="Loading technology..." />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">{error || 'Technology not found'}</p>
            <Link
              href="/technologies"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to Technologies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { technology, current_scores, chart_data, latest_signals, related_technologies, rank, total_ranked } = data

  // Extract confidence grade from raw_sub_scores (computed by confidence.ts, stored by pipeline.ts)
  const rawSub = current_scores?.raw_sub_scores as Record<string, unknown> | null | undefined
  const confidenceGrade =
    rawSub && typeof rawSub === 'object' && 'confidence' in rawSub &&
      typeof (rawSub.confidence as any)?.grade === 'string'
      ? String((rawSub.confidence as any).grade)
      : null

  // Extract lifecycle stage from raw_sub_scores
  const lifecycleStage =
    rawSub && typeof rawSub === 'object' && 'lifecycle' in rawSub &&
      typeof rawSub.lifecycle === 'object' && rawSub.lifecycle !== null &&
      'stage' in (rawSub.lifecycle as object)
      ? String((rawSub.lifecycle as any).stage)
      : null

  // Extract signal agreement (0-100) from confidence data
  const signalAgreementRaw = (rawSub?.confidence as any)?.signalAgreement as number | undefined
  const signalAgreement = signalAgreementRaw != null ? signalAgreementRaw : null

  // Extract momentum detail for MomentumDetailCard
  const momentumDetail = (rawSub?.momentum_detail as any) ?? null

  // Extract source coverage count to show in DataFreshness
  const sourceCoverageRaw = (rawSub?.confidence as any)?.sourceCoverage as number | undefined
  // Category-based max sources (mirrors MAX_SOURCES in confidence.ts)
  const MAX_SOURCES_BY_CATEGORY: Record<string, number> = {
    language: 14, frontend: 14, backend: 13, database: 10,
    devops: 10, cloud: 9, mobile: 11, ai_ml: 12, blockchain: 12,
  }
  const totalSources = MAX_SOURCES_BY_CATEGORY[technology.category] ?? 12
  const sourceCount = sourceCoverageRaw != null
    ? Math.round((sourceCoverageRaw / 100) * totalSources)
    : null

  // Build explainer dimensions for the "Why This Score?" panel
  const explainerDimensions = current_scores
    ? buildScoreExplainerDimensions(
      {
        github_score: current_scores.github_score,
        community_score: current_scores.community_score,
        jobs_score: current_scores.jobs_score,
        ecosystem_score: current_scores.ecosystem_score,
        onchain_score: current_scores.onchain_score,
      },
      rawSub ?? null,
      technology.category
    )
    : []

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Sticky Summary Bar (visible only when scrolled) */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-40 border-b bg-background/80 backdrop-blur-xl transition-all duration-300 shadow-sm",
          isScrolled ? "translate-y-0 opacity-100 border-border/50" : "-translate-y-full opacity-0 border-transparent pointer-events-none"
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 py-2 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">{technology.name}</span>
            <ScoreBadge score={current_scores?.composite_score ?? null} size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <MomentumBadge momentum={current_scores?.momentum ?? null} size="sm" />
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hidden sm:block text-xs font-medium text-primary hover:underline"
            >
              Back to top
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <motion.nav
        initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.3 }}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/technologies" className="transition-colors hover:text-foreground">
          Technologies
        </Link>
        <ChevronRight size={14} className="opacity-50" />
        <span className="text-foreground font-medium">{technology.name}</span>
      </motion.nav>

      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-8"
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {technology.name}
            </h1>
            <p className="text-muted-foreground">{technology.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {rank != null && total_ranked != null && (
              <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded border border-border/50 bg-muted/20">
                #{rank} of {total_ranked}
              </span>
            )}
            <ConfidenceBadge
              completeness={current_scores?.data_completeness ?? null}
              grade={confidenceGrade as any}
              size="md"
            />
            <ScoreBadge
              score={current_scores?.composite_score ?? null}
              size="lg"
              confidenceGrade={confidenceGrade}
            />
          </div>
        </div>

        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            compositeScore={current_scores?.composite_score ?? null}
            momentum={current_scores?.momentum ?? null}
            dataCompleteness={current_scores?.data_completeness ?? null}
            size="md"
          />
          {lifecycleStage && (
            <LifecycleBadge stage={lifecycleStage} size="md" />
          )}
          <CategoryBadge category={technology.category} size="md" />
          <MomentumBadge momentum={current_scores?.momentum ?? null} size="md" />
          {technology.website_url && (
            <a
              href={technology.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink size={14} />
              Website
            </a>
          )}
          {technology.github_repo && (
            <a
              href={`https://github.com/${technology.github_repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Github size={14} />
              GitHub
            </a>
          )}
          <DataFreshness
            timestamp={current_scores?.computed_at ?? null}
            sourceCount={sourceCount}
            totalSources={totalSources}
            signalAgreement={signalAgreement}
          />
        </div>
      </motion.div>

      {/* Anomaly Banner (if anomalies detected) */}
      {data.anomalies && data.anomalies.length > 0 && (
        <motion.section
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <AnomalyBanner
            anomalies={data.anomalies.map(a => ({
              type: a.type as any,
              severity: a.severity as any,
              metric: a.metric,
              deviationSigma: a.deviationSigma,
              explanation: a.explanation
            }))}
            techSlug={slug}
          />
        </motion.section>
      )}

      {/* AI Insight Card (replaces template recommendation) */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        {ai.isLoading && <AIInsightSkeleton />}

        {ai.error && !ai.insight && (
          <AIInsightError error={ai.error} onRetry={ai.refetch} />
        )}

        {ai.insight && (
          <AIInsightCard
            insight={ai.insight}
            score={current_scores?.composite_score ?? undefined}
            freshness={ai.freshness}
            age={ai.age}
          >
            <FeedbackButtons insightId={`tech_${slug}`} />
          </AIInsightCard>
        )}

        {/* Fallback: template insight if AI unavailable and not loading */}
        {!ai.isLoading && !ai.insight && !ai.error && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="mb-1 text-sm font-semibold text-foreground">Career Insight</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {getRecommendation(
                    current_scores?.composite_score ?? null,
                    current_scores?.momentum ?? null,
                    current_scores?.jobs_score ?? null,
                    current_scores?.community_score ?? null,
                    current_scores?.data_completeness ?? null
                  )}
                </p>
                {current_scores?.momentum !== null && current_scores?.momentum !== undefined && (
                  <p className="mt-2 text-xs text-muted-foreground/80">
                    Momentum: {getMomentumInsight(current_scores.momentum)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.section>

      {/* Score Breakdown — "Why This Score?" expandable explainer */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Score Breakdown</h2>
          {confidenceGrade && (
            <span className="text-xs text-muted-foreground">
              Confidence:{' '}
              <span
                className={
                  confidenceGrade === 'A' || confidenceGrade === 'B'
                    ? 'text-emerald-400 font-semibold'
                    : confidenceGrade === 'C'
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-400 font-semibold'
                }
              >
                Grade {confidenceGrade}
              </span>
            </span>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          <TechRadarChart
            githubScore={current_scores?.github_score ?? null}
            communityScore={current_scores?.community_score ?? null}
            jobsScore={current_scores?.jobs_score ?? null}
            ecosystemScore={current_scores?.ecosystem_score ?? null}
            compositeScore={current_scores?.composite_score ?? null}
            techColor={technology.color}
          />
          {/* "Why This Score?" expandable explainer */}
          <ScoreExplainer
            dimensions={explainerDimensions}
            compositeScore={current_scores?.composite_score ?? null}
            confidenceGrade={confidenceGrade}
          />
        </div>
      </motion.section>

      {/* On-Chain Health — blockchain techs only */}
      {technology.category === 'blockchain' && current_scores?.onchain_score != null && (
        <motion.section
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.25 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-xl font-semibold text-foreground">On-Chain Health</h2>
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-foreground">Onchain Score</span>
              </div>
              <span className="text-2xl font-bold text-violet-400">
                {current_scores.onchain_score.toFixed(1)}
                <span className="ml-0.5 text-sm font-normal text-muted-foreground">/100</span>
              </span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all"
                style={{ width: `${Math.min(100, current_scores.onchain_score)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Composite of protocol TVL, on-chain developer activity, and chain transaction volume.{' '}
              <Link href="/blockchain" className="text-violet-400 hover:underline">
                View full blockchain dashboard →
              </Link>
            </p>
          </div>
        </motion.section>
      )}

      {/* Trend Chart + Momentum Detail */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">90-Day Trend</h2>
        <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm hover:border-primary/20 transition-colors">
          <TrendChart data={chart_data} />
        </div>
        {momentumDetail && (
          <div className="mt-4">
            <MomentumDetailCard
              momentumDetail={momentumDetail}
              currentScore={current_scores?.composite_score ?? null}
            />
          </div>
        )}
      </motion.section>

      {/* Star History */}
      {technology.github_repo && (
        <motion.section
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-xl font-semibold text-foreground">Star History</h2>
          <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <StarHistoryChart slug={slug} techColor={technology.color} />
          </div>
        </motion.section>
      )}

      {/* Package Downloads */}
      {(technology.npm_package || technology.pypi_package || technology.crates_package || technology.packagist_package || technology.rubygems_package || technology.nuget_package) && (
        <motion.section
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.36 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-xl font-semibold text-foreground">Package Downloads</h2>
          <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <PackageDownloadsChart slug={slug} techColor={technology.color} />
          </div>
        </motion.section>
      )}

      {/* Job Market Demand */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.37 }}
        className="mb-8"
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">Job Market Demand</h2>
        <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm hover:border-primary/20 transition-colors">
          <JobMarketChart slug={slug} techColor={technology.color} />
        </div>
      </motion.section>

      {/* Latest Signals */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">Latest Signals</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* GitHub */}
          {latest_signals.github && (
            <SourceSignalCard
              title="GitHub"
              icon={<Github size={16} />}
              signals={[
                { label: 'Stars', value: latest_signals.github.stars },
                { label: 'Forks', value: latest_signals.github.forks },
                { label: 'Open Issues', value: latest_signals.github.open_issues },
              ]}
              link={technology.github_repo ? `https://github.com/${technology.github_repo}` : undefined}
            />
          )}

          {/* Community */}
          {latest_signals.hackernews && (
            <SourceSignalCard
              title="Hacker News"
              icon={<MessageSquare size={16} />}
              signals={[
                { label: 'Mentions (30d)', value: latest_signals.hackernews.mentions ?? 0 },
                { label: 'Avg Upvotes', value: latest_signals.hackernews.avg_upvotes?.toFixed(1) ?? '0.0' },
                { label: 'Sentiment', value: latest_signals.hackernews.sentiment ? `${(latest_signals.hackernews.sentiment * 100).toFixed(0)}%` : '0%' },
              ]}
            />
          )}

          {/* Jobs */}
          {latest_signals.jobs && (
            <SourceSignalCard
              title="Job Market"
              icon={<Briefcase size={16} />}
              signals={[
                { label: 'Total Jobs', value: latest_signals.jobs.total },
                { label: 'Adzuna', value: latest_signals.jobs.adzuna },
                { label: 'Remote', value: latest_signals.jobs.remotive },
              ]}
            />
          )}

          {/* Ecosystem */}
          {latest_signals.npm && (
            <SourceSignalCard
              title="npm Downloads"
              icon={<Package size={16} />}
              signals={[
                { label: 'Weekly', value: latest_signals.npm.weekly_downloads },
              ]}
              link={technology.npm_package ? `https://www.npmjs.com/package/${technology.npm_package}` : undefined}
            />
          )}

          {latest_signals.stackoverflow && (
            <SourceSignalCard
              title="Stack Overflow"
              icon={<MessageSquare size={16} />}
              signals={[
                { label: 'Questions (30d)', value: latest_signals.stackoverflow.questions_30d },
                { label: 'Total Questions', value: latest_signals.stackoverflow.total_questions },
              ]}
              link={`https://stackoverflow.com/questions/tagged/${technology.stackoverflow_tag}`}
            />
          )}
        </div>

        {/* YouTube Signals — spans full width when present */}
        {latest_signals.youtube && (
          <div className="mt-4">
            <YouTubeSignalsCard signals={latest_signals.youtube} />
          </div>
        )}
      </motion.section>

      {/* Alternatives */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.45 }}
        className="mb-8"
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">Alternatives</h2>
        <AlternativesPanel slug={slug} />
      </motion.section>

      {/* Related Technologies */}
      {related_technologies && related_technologies.length > 0 && (
        <motion.section
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.5 }}
        >
          <h2 className="mb-4 text-xl font-semibold text-foreground">Related Technologies</h2>
          <RelatedTechnologies technologies={related_technologies} />
        </motion.section>
      )}
    </div>
  )
}

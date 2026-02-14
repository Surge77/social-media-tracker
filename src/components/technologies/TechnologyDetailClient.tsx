'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, MessageSquare, Briefcase, Package } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAIInsight } from '@/hooks/useAIInsight'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge'
import { LifecycleBadge } from '@/components/shared/LifecycleBadge'
import { DataFreshness } from '@/components/shared/DataFreshness'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import { ScoreBreakdown } from '@/components/technologies/ScoreBreakdown'
import { TrendChart } from '@/components/technologies/TrendChart'
import { SourceSignalCard } from '@/components/technologies/SourceSignalCard'
import { RelatedTechnologies } from '@/components/technologies/RelatedTechnologies'
import { AIInsightCard, AIInsightSkeleton, AIInsightError } from '@/components/ai/AIInsightCard'
import { FeedbackButtons } from '@/components/ai/FeedbackButtons'
import { AnomalyBanner } from '@/components/technologies/AnomalyBanner'
import { getRecommendation, getMomentumInsight } from '@/lib/insights'
import type { TechnologyDetail } from '@/types'

export function TechnologyDetailClient() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const prefersReducedMotion = useReducedMotion()

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
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading technology...</p>
          </div>
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

  const { technology, current_scores, chart_data, latest_signals, related_technologies } = data

  // Extract lifecycle stage from raw_sub_scores
  const lifecycleStage =
    current_scores?.raw_sub_scores &&
    typeof current_scores.raw_sub_scores === 'object' &&
    'lifecycle' in current_scores.raw_sub_scores &&
    typeof current_scores.raw_sub_scores.lifecycle === 'object' &&
    current_scores.raw_sub_scores.lifecycle !== null &&
    'stage' in current_scores.raw_sub_scores.lifecycle
      ? String(current_scores.raw_sub_scores.lifecycle.stage)
      : null

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Back Button */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </motion.div>

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
            <ConfidenceBadge
              completeness={current_scores?.data_completeness ?? null}
              size="md"
            />
            <ScoreBadge score={current_scores?.composite_score ?? null} size="lg" />
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
          <DataFreshness timestamp={current_scores?.computed_at ?? null} />
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

      {/* Score Breakdown */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">Score Breakdown</h2>
        <ScoreBreakdown
          githubScore={current_scores?.github_score ?? null}
          communityScore={current_scores?.community_score ?? null}
          jobsScore={current_scores?.jobs_score ?? null}
          ecosystemScore={current_scores?.ecosystem_score ?? null}
        />
      </motion.section>

      {/* Trend Chart */}
      <motion.section
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="mb-4 text-xl font-semibold text-foreground">90-Day Trend</h2>
        <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm">
          <TrendChart data={chart_data} />
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
                { label: 'Mentions (30d)', value: latest_signals.hackernews.mentions },
                { label: 'Avg Upvotes', value: latest_signals.hackernews.avg_upvotes.toFixed(1) },
                { label: 'Sentiment', value: `${(latest_signals.hackernews.sentiment * 100).toFixed(0)}%` },
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

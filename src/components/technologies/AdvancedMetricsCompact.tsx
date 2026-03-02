'use client'

import { BarChart3, Briefcase, Layers, MessageSquare, Package } from 'lucide-react'
import type { ReactNode } from 'react'
import { TrendChart } from '@/components/technologies/TrendChart'
import { ScoreExplainer, type ExplainerDimension } from '@/components/technologies/ScoreExplainer'
import type { ChartDataPoint, DailyScore, LatestSignals, Technology } from '@/types'

interface AdvancedMetricsCompactProps {
  technology: Pick<Technology, 'category'>
  currentScores: DailyScore | null
  chartData: ChartDataPoint[]
  latestSignals: LatestSignals
  confidenceGrade: string | null
  explainerDimensions: ExplainerDimension[]
}

function fmt(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return value.toLocaleString('en-US')
}

export function AdvancedMetricsCompact({
  technology,
  currentScores,
  chartData,
  latestSignals,
  confidenceGrade,
  explainerDimensions,
}: AdvancedMetricsCompactProps) {
  const jobsTotal = latestSignals.jobs?.total ?? null
  const weeklyDownloads = latestSignals.npm?.weekly_downloads ?? null
  const soQuestions30d = latestSignals.stackoverflow?.questions_30d ?? null
  const communityMentions = latestSignals.hackernews?.mentions ?? null
  const hasMarketData = jobsTotal !== null || weeklyDownloads !== null || soQuestions30d !== null

  return (
    <section className="mb-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-lg border border-border bg-card/40 p-4 lg:col-span-1">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary/80" />
          <h3 className="text-sm font-semibold text-foreground">Score Drivers</h3>
        </div>
        <ScoreExplainer
          dimensions={explainerDimensions}
          compositeScore={currentScores?.composite_score ?? null}
          confidenceGrade={confidenceGrade}
          mode="compact"
        />
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 lg:col-span-1">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary/80" />
          <h3 className="text-sm font-semibold text-foreground">Trend Signals</h3>
        </div>
        <TrendChart data={chartData} mode="compact" />
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 lg:col-span-1">
        <div className="mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary/80" />
          <h3 className="text-sm font-semibold text-foreground">Market Reality</h3>
        </div>

        {hasMarketData ? (
          <div className="space-y-2">
            <MetricRow
              icon={<Briefcase className="h-3.5 w-3.5" />}
              label="Total Jobs"
              value={fmt(jobsTotal)}
            />
            <MetricRow
              icon={<Package className="h-3.5 w-3.5" />}
              label="Weekly Downloads"
              value={fmt(weeklyDownloads)}
            />
            <MetricRow
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              label="SO Questions (30d)"
              value={fmt(soQuestions30d)}
            />
            <MetricRow
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              label="HN Mentions (30d)"
              value={fmt(communityMentions)}
            />
            {technology.category === 'blockchain' && currentScores?.onchain_score != null && (
              <MetricRow
                icon={<Layers className="h-3.5 w-3.5" />}
                label="On-Chain Score"
                value={`${Math.round(currentScores.onchain_score)}/100`}
              />
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Limited data available for market metrics right now.
          </p>
        )}
      </div>
    </section>
  )
}

function MetricRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/10 px-2.5 py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="font-mono text-xs font-semibold text-foreground">{value}</span>
    </div>
  )
}

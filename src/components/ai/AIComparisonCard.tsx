'use client'

import React, { useState } from 'react'
import { Lightbulb, Users, Briefcase, GraduationCap, Clock, AlertTriangle, RefreshCw, ShieldAlert, BookOpen, TrendingUp, ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ComparisonInsight } from '@/lib/ai/generators/comparison-insight'

// ---- Skeleton ----

export function AIComparisonSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/30 p-6 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-md bg-muted/50" />
        <div className="flex-1 space-y-4">
          <div className="h-5 w-2/3 rounded bg-muted/50" />
          <div className="h-4 w-full rounded bg-muted/30" />
          <div className="h-4 w-5/6 rounded bg-muted/30" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-32 rounded bg-muted/30" />
            <div className="h-32 rounded bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Error state ----

export function AIComparisonError({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-destructive/10 p-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-1 text-sm font-semibold text-foreground">AI Comparison Unavailable</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Career advice tabs ----

type AudienceTab = 'beginners' | 'experienced' | 'jobSeekers'

const AUDIENCE_TABS: Array<{ key: AudienceTab; label: string; icon: React.ReactNode }> = [
  { key: 'beginners', label: 'Beginners', icon: <GraduationCap size={13} /> },
  { key: 'experienced', label: 'Experienced', icon: <Users size={13} /> },
  { key: 'jobSeekers', label: 'Job Seekers', icon: <Briefcase size={13} /> },
]

// ---- Main component ----

interface AIComparisonCardProps {
  comparison: ComparisonInsight
  cached?: boolean
  children?: React.ReactNode // slot for FeedbackButtons
  className?: string
}

export function AIComparisonCard({
  comparison,
  children,
  className,
}: AIComparisonCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState<AudienceTab>('beginners')

  const careerAdviceMap: Record<AudienceTab, string> = {
    beginners: comparison.careerAdvice.forBeginners,
    experienced: comparison.careerAdvice.forExperienced,
    jobSeekers: comparison.careerAdvice.forJobSeekers,
  }

  // Extract technology names for two-column layout
  const technologies = comparison.winner.byUseCase?.map(uc => uc.recommendation) || []
  const techNames = Array.from(new Set(technologies))

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg', className)}
    >
      {/* Header with Big Verdict */}
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">The Verdict</span>
        </div>

        <h2 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
          {comparison.headline}
        </h2>

        <p className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground">
          {comparison.verdict}
        </p>

        {/* Overall Winner Badge */}
        {comparison.winner.overall && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-emerald-500/40 bg-emerald-500/15 px-4 py-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">
              Overall winner: {comparison.winner.overall}
            </span>
          </div>
        )}
      </div>

      {/* Two-Column Strength Comparison */}
      {Array.isArray(comparison.winner.byUseCase) && comparison.winner.byUseCase.length >= 2 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {comparison.winner.byUseCase.slice(0, 2).map((uc, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-card/50 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">
                  {uc.recommendation}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Best for:</span> {uc.useCase}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Surprising Finding - Always Visible */}
      {comparison.surprisingFinding && (
        <div className="mb-6 rounded-lg border-2 border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-400">
                Surprising Finding
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {comparison.surprisingFinding}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dimension Analysis Grid */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Dimension Breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(comparison.dimensionAnalysis).map(([key, text]) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-card/30 p-3"
            >
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                {key}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Career Advice Tabs */}
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Career Guidance</h3>
        <div className="mb-3 flex gap-1">
          {AUDIENCE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {careerAdviceMap[activeTab]}
        </p>
      </div>

      {/* Time Horizon */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock size={13} />
            Short Term (3-6 months)
          </div>
          <p className="text-sm text-foreground">{comparison.timeHorizon.shortTerm}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock size={13} />
            Long Term (1-2 years)
          </div>
          <p className="text-sm text-foreground">{comparison.timeHorizon.longTerm}</p>
        </div>
      </div>

      {/* Risk Analysis */}
      {comparison.riskAnalysis && comparison.riskAnalysis.risks.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldAlert size={16} className="text-destructive" />
            Risk Analysis
          </div>
          <div className="space-y-2">
            {comparison.riskAnalysis.risks.map((risk, idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-lg border p-3',
                  risk.severity === 'high' && 'border-destructive/40 bg-destructive/10',
                  risk.severity === 'medium' && 'border-warning/40 bg-warning/10',
                  risk.severity === 'low' && 'border-border bg-card/30'
                )}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{risk.technology}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      risk.severity === 'high' && 'bg-destructive/20 text-destructive',
                      risk.severity === 'medium' && 'bg-warning/20 text-warning',
                      risk.severity === 'low' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {risk.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{risk.risk}</p>
                {risk.mitigation && (
                  <p className="mt-1.5 text-xs text-foreground">
                    <span className="font-semibold">Mitigation:</span> {risk.mitigation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Curve */}
      {comparison.learningCurve && comparison.learningCurve.comparisons.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen size={16} className="text-primary" />
            Learning Investment
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {comparison.learningCurve.comparisons.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{item.technology}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      item.difficulty === 'easy' && 'bg-success/20 text-success',
                      item.difficulty === 'moderate' && 'bg-warning/20 text-warning',
                      item.difficulty === 'steep' && 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {item.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Time:</span> {item.timeToProductivity}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Prerequisites:</span> {item.prerequisites}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Outlook */}
      {comparison.marketOutlook && comparison.marketOutlook.predictions.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp size={16} className="text-primary" />
            Market Outlook (1 Year)
          </div>
          <div className="space-y-2">
            {comparison.marketOutlook.predictions.map((pred, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card/30 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{pred.technology}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        pred.outlook === 'growing' && 'bg-success/20 text-success',
                        pred.outlook === 'stable' && 'bg-primary/20 text-primary',
                        pred.outlook === 'declining' && 'bg-destructive/20 text-destructive'
                      )}
                    >
                      {pred.outlook}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({pred.confidence} confidence)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{pred.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration Advice */}
      {comparison.migrationAdvice && comparison.migrationAdvice.paths.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ArrowRightLeft size={16} className="text-primary" />
            Migration Paths
          </div>
          <div className="space-y-2">
            {comparison.migrationAdvice.paths.map((path, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card/30 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {path.from} → {path.to}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      path.difficulty === 'easy' && 'bg-success/20 text-success',
                      path.difficulty === 'moderate' && 'bg-warning/20 text-warning',
                      path.difficulty === 'hard' && 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {path.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Effort:</span> {path.effort}
                </p>
                {path.gotchas && (
                  <p className="mt-1.5 text-xs text-warning">
                    <span className="font-semibold">⚠️ Gotchas:</span> {path.gotchas}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback slot */}
      {children && <div className="border-t border-border/30 pt-4">{children}</div>}
    </motion.div>
  )
}

'use client'

import React, { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp, Users, Briefcase, GraduationCap, Clock, AlertTriangle, RefreshCw, ShieldAlert, BookOpen, TrendingUp, ArrowRightLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ComparisonInsight } from '@/lib/ai/generators/comparison-insight'

// ---- Skeleton ----

export function AIComparisonSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/30 p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-muted/50" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-muted/50" />
          <div className="h-3 w-full rounded bg-muted/30" />
          <div className="h-3 w-5/6 rounded bg-muted/30" />
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
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<AudienceTab>('beginners')

  const careerAdviceMap: Record<AudienceTab, string> = {
    beginners: comparison.careerAdvice.forBeginners,
    experienced: comparison.careerAdvice.forExperienced,
    jobSeekers: comparison.careerAdvice.forJobSeekers,
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.4 }}
      className={cn('rounded-lg border border-primary/20 bg-primary/5 p-5', className)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-1 text-sm font-semibold text-foreground">
            {comparison.headline}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {comparison.verdict}
          </p>
        </div>
      </div>

      {/* Winner badges */}
      {comparison.winner.overall && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Overall:</span>
          <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            {comparison.winner.overall}
          </span>
          {Array.isArray(comparison.winner.byUseCase) && comparison.winner.byUseCase.slice(0, 3).map((uc) => (
            <span
              key={uc.useCase}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
            >
              <span className="font-medium text-foreground/70">{uc.useCase}:</span>{' '}
              {uc.recommendation}
            </span>
          ))}
        </div>
      )}

      {/* Expand/collapse for details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} />
            Less detail
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            More detail
          </>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Dimension analysis */}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(comparison.dimensionAnalysis).map(([key, text]) => (
                <div
                  key={key}
                  className="rounded-md border border-border/50 bg-card/30 p-3"
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {key}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>

            {/* Surprising finding */}
            {comparison.surprisingFinding && (
              <div className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-300/90">
                  <span className="font-semibold">Surprising:</span>{' '}
                  {comparison.surprisingFinding}
                </p>
              </div>
            )}

            {/* Career advice tabs */}
            <div className="mt-4">
              <div className="mb-2 flex gap-1">
                {AUDIENCE_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      activeTab === tab.key
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {careerAdviceMap[activeTab]}
              </p>
            </div>

            {/* Time horizon */}
            <div className="mt-3 flex gap-3">
              <div className="flex-1 rounded-md border border-border/50 bg-card/30 p-2.5">
                <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70">
                  <Clock size={11} />
                  Short term
                </div>
                <p className="text-xs text-muted-foreground">{comparison.timeHorizon.shortTerm}</p>
              </div>
              <div className="flex-1 rounded-md border border-border/50 bg-card/30 p-2.5">
                <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70">
                  <Clock size={11} />
                  Long term
                </div>
                <p className="text-xs text-muted-foreground">{comparison.timeHorizon.longTerm}</p>
              </div>
            </div>

            {/* Risk Analysis */}
            {comparison.riskAnalysis && comparison.riskAnalysis.risks.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ShieldAlert size={13} className="text-destructive" />
                  Risk Analysis
                </div>
                <div className="space-y-2">
                  {comparison.riskAnalysis.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'rounded-md border p-2.5',
                        risk.severity === 'high' && 'border-destructive/30 bg-destructive/5',
                        risk.severity === 'medium' && 'border-warning/30 bg-warning/5',
                        risk.severity === 'low' && 'border-border/50 bg-card/30'
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{risk.technology}</span>
                        <span
                          className={cn(
                            'text-[10px] font-semibold uppercase tracking-wide',
                            risk.severity === 'high' && 'text-destructive',
                            risk.severity === 'medium' && 'text-warning',
                            risk.severity === 'low' && 'text-muted-foreground'
                          )}
                        >
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{risk.risk}</p>
                      {risk.mitigation && (
                        <p className="mt-1 text-[11px] text-muted-foreground/80">
                          <span className="font-medium">Mitigation:</span> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Curve */}
            {comparison.learningCurve && comparison.learningCurve.comparisons.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <BookOpen size={13} className="text-primary" />
                  Learning Investment
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {comparison.learningCurve.comparisons.map((item, idx) => (
                    <div key={idx} className="rounded-md border border-border/50 bg-card/30 p-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{item.technology}</span>
                        <span
                          className={cn(
                            'text-[10px] font-semibold uppercase tracking-wide',
                            item.difficulty === 'easy' && 'text-success',
                            item.difficulty === 'moderate' && 'text-warning',
                            item.difficulty === 'steep' && 'text-destructive'
                          )}
                        >
                          {item.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium">Time:</span> {item.timeToProductivity}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium">Prerequisites:</span> {item.prerequisites}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Outlook */}
            {comparison.marketOutlook && comparison.marketOutlook.predictions.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <TrendingUp size={13} className="text-primary" />
                  Market Outlook (1 Year)
                </div>
                <div className="space-y-2">
                  {comparison.marketOutlook.predictions.map((pred, idx) => (
                    <div key={idx} className="rounded-md border border-border/50 bg-card/30 p-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{pred.technology}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-[10px] font-semibold uppercase tracking-wide',
                              pred.outlook === 'growing' && 'text-success',
                              pred.outlook === 'stable' && 'text-primary',
                              pred.outlook === 'declining' && 'text-destructive'
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
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ArrowRightLeft size={13} className="text-primary" />
                  Migration Paths
                </div>
                <div className="space-y-2">
                  {comparison.migrationAdvice.paths.map((path, idx) => (
                    <div key={idx} className="rounded-md border border-border/50 bg-card/30 p-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">
                          {path.from} → {path.to}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-semibold uppercase tracking-wide',
                            path.difficulty === 'easy' && 'text-success',
                            path.difficulty === 'moderate' && 'text-warning',
                            path.difficulty === 'hard' && 'text-destructive'
                          )}
                        >
                          {path.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium">Effort:</span> {path.effort}
                      </p>
                      {path.gotchas && (
                        <p className="mt-1 text-[11px] text-warning">
                          <span className="font-medium">Gotchas:</span> {path.gotchas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback slot */}
      {children && <div className="mt-3 border-t border-border/30 pt-3">{children}</div>}
    </motion.div>
  )
}

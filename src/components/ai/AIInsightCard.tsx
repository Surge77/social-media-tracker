'use client'

import React from 'react'
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Shield,
  BarChart3,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScoreRing } from '@/components/ui/score-ring'
import { TerminalCard } from '@/components/ui/terminal-card'
import type { TechInsight } from '@/lib/ai/generators/tech-insight'

// ---- Priority config ----

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  critical: {
    label: 'Must Learn',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  high: {
    label: 'High Priority',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  medium: {
    label: 'Worth Learning',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  low: {
    label: 'Optional',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  skip: {
    label: 'Low Priority',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
}

// ---- Skeleton ----

export function AIInsightSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/30 p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-muted/50" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded bg-muted/50" />
          <div className="h-3 w-full rounded bg-muted/30" />
          <div className="h-3 w-5/6 rounded bg-muted/30" />
          <div className="h-3 w-2/3 rounded bg-muted/30" />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-md bg-muted/20 p-3">
            <div className="h-3 w-1/3 rounded bg-muted/40 mb-2" />
            <div className="h-3 w-full rounded bg-muted/30" />
            <div className="h-3 w-4/5 rounded bg-muted/30 mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Error state ----

export function AIInsightError({
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
          <h2 className="mb-1 text-sm font-semibold text-foreground">
            AI Insight Unavailable
          </h2>
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

// ---- Stale indicator ----

function StaleIndicator({ freshness, age }: { freshness: string; age: number | null }) {
  if (freshness === 'fresh') return null

  const ageText = age
    ? age < 1
      ? 'less than an hour ago'
      : age < 24
        ? `${Math.round(age)} hours ago`
        : `${Math.round(age / 24)} days ago`
    : null

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
      <Clock size={11} />
      <span>
        {freshness === 'stale' ? 'Updating...' : 'Last updated'}
        {ageText && ` ${ageText}`}
      </span>
    </div>
  )
}

// ---- Main component ----

interface AIInsightCardProps {
  insight: TechInsight
  score?: number | null
  freshness?: 'fresh' | 'stale' | 'expired' | null
  age?: number | null
  children?: React.ReactNode // slot for FeedbackButtons
  className?: string
}

export function AIInsightCard({
  insight,
  score,
  freshness,
  age,
  children,
  className,
}: AIInsightCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const priority = PRIORITY_CONFIG[insight.learningPriority] ?? PRIORITY_CONFIG.medium

  const sections = [
    {
      icon: <TrendingUp size={13} />,
      title: 'Trend',
      content: insight.trendNarrative,
      prompt: 'trend-narrative',
    },
    {
      icon: <BookOpen size={13} />,
      title: 'Career Advice',
      content: insight.careerAdvice,
      prompt: 'career-advice',
    },
    {
      icon: <AlertTriangle size={13} />,
      title: 'Risk Factors',
      content: insight.riskFactors,
      prompt: 'risk-factors',
    },
    {
      icon: <BarChart3 size={13} />,
      title: 'Score Breakdown',
      content: insight.scoreExplanation,
      prompt: 'score-breakdown',
    },
  ]

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.4 }}
      className={cn('rounded-lg border border-primary/20 bg-primary/5 p-5', className)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {score != null ? (
          <ScoreRing score={score} size={64} strokeWidth={5} label="score" />
        ) : (
          <div className="rounded-md bg-primary/10 p-2 shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-foreground">
              {insight.headline}
            </h2>
            <span
              className={cn(
                'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold',
                priority.color,
                priority.bgColor,
                priority.borderColor,
                'border'
              )}
            >
              {priority.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {insight.momentumContext}
          </p>
          {freshness && (
            <div className="mt-1">
              <StaleIndicator freshness={freshness} age={age ?? null} />
            </div>
          )}
        </div>
      </div>

      {/* Detail sections in terminal card */}
      <TerminalCard title="ai-analysis" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-primary/70">{section.icon}</span>
                <span className="font-mono text-[11px] font-semibold text-primary/80">
                  {section.title}
                </span>
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-zinc-400">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </TerminalCard>

      {/* Confidence + lifecycle note */}
      {insight.confidenceNote && (
        <div className="mt-3 flex items-start gap-1.5">
          <Shield size={11} className="mt-0.5 text-muted-foreground/60" />
          <p className="text-[11px] text-muted-foreground/70">{insight.confidenceNote}</p>
        </div>
      )}

      {/* Feedback slot */}
      {children && <div className="mt-3 border-t border-border/30 pt-3">{children}</div>}
    </motion.div>
  )
}

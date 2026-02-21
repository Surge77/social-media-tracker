'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, TrendingDown, Minus, CheckCircle2, Shield, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { Sparkline } from '@/components/technologies/Sparkline'
import { RankChangeBadge } from '@/components/technologies/RankChangeBadge'
import LifecycleBadge from '@/components/technologies/LifecycleBadge'
import QuickCompareLinks from '@/components/technologies/QuickCompareLinks'
import { generateVerdict, type Verdict } from '@/lib/insights/verdict'
import type { TechnologyWithScore } from '@/types'

interface TechCardProps {
  technology: TechnologyWithScore
  rank?: number
  index?: number
  className?: string
  allTechnologies?: TechnologyWithScore[]
}

const VERDICT_STYLES: Record<Verdict['recommendation'], {
  border: string; bg: string; badgeBg: string; text: string; icon: React.ReactNode
}> = {
  'learn-it':  { border: 'hover:border-emerald-500/40', bg: '', badgeBg: 'bg-emerald-500/10 text-emerald-500', text: 'text-emerald-500', icon: <CheckCircle2 size={11} /> },
  'watch-it':  { border: 'hover:border-amber-500/40',   bg: '', badgeBg: 'bg-amber-500/10 text-amber-500',   text: 'text-amber-500',   icon: <TrendingUp size={11} /> },
  'maintain':  { border: 'hover:border-sky-500/40',     bg: '', badgeBg: 'bg-sky-500/10 text-sky-400',       text: 'text-sky-400',     icon: <Shield size={11} /> },
  'caution':   { border: 'hover:border-orange-500/40',  bg: '', badgeBg: 'bg-orange-500/10 text-orange-500', text: 'text-orange-500',  icon: <AlertTriangle size={11} /> },
  'declining': { border: 'hover:border-destructive/40', bg: '', badgeBg: 'bg-destructive/10 text-destructive', text: 'text-destructive', icon: <TrendingDown size={11} /> },
}

export const TechCard = React.forwardRef<HTMLDivElement, TechCardProps>(
  ({ technology, rank, index = 0, className, allTechnologies = [] }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    const verdict = generateVerdict(
      technology.composite_score,
      technology.momentum,
      technology.jobs_score,
      technology.name,
    )

    const vstyle = VERDICT_STYLES[verdict.recommendation]

    const momentumIcon =
      verdict.momentumLabel === 'Rising' ? <TrendingUp size={11} className="text-emerald-500" /> :
      verdict.momentumLabel === 'Declining' ? <TrendingDown size={11} className="text-destructive" /> :
      <Minus size={11} className="text-muted-foreground" />

    const jobsBarWidth = Math.round(technology.jobs_score ?? 0)

    return (
      <motion.div
        ref={ref}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
        className={cn('flex flex-col gap-1.5', className)}
      >
        <Link
          href={`/technologies/${technology.slug}`}
          className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <div className={`rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:bg-card/50 hover:shadow-md ${vstyle.border}`}>

            {/* Top row: verdict + lifecycle + category */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${vstyle.badgeBg}`}>
                {vstyle.icon}
                {verdict.badge}
              </span>
              <div className="flex items-center gap-1">
                <LifecycleBadge stage={technology.lifecycle_stage} />
                <CategoryBadge category={technology.category} size="sm" />
              </div>
            </div>

            {/* Name + rank */}
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {rank && (
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">#{rank}</span>
                    <RankChangeBadge rankChange={technology.rank_change} />
                  </div>
                )}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: technology.color }}
                />
                <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                  {technology.name}
                </h3>
              </div>
              <ArrowRight size={14} className="shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>

            {/* Description */}
            <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">
              {technology.description}
            </p>

            {/* AI insight quote */}
            {technology.ai_summary && (
              <p className="mb-3 line-clamp-2 text-[11px] italic text-muted-foreground/70">
                &ldquo;{technology.ai_summary}&rdquo;
              </p>
            )}

            {/* Job demand bar */}
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Job demand</span>
                <span className="font-medium text-foreground">{jobsBarWidth}/100</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all"
                  style={{ width: `${jobsBarWidth}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                {momentumIcon}
                {verdict.momentumLabel}
              </span>
              <span className="flex items-center gap-1">
                Score <span className="font-medium text-foreground">{Math.round(technology.composite_score ?? 0)}</span>
              </span>
              {technology.sparkline && technology.sparkline.length > 0 && (
                <Sparkline data={technology.sparkline} width={64} height={20} />
              )}
            </div>
          </div>
        </Link>

        {/* Compare links — outside the Link to prevent nav conflicts */}
        {allTechnologies.length > 1 && (
          <div className="px-1">
            <QuickCompareLinks technology={technology} allTechnologies={allTechnologies} />
          </div>
        )}
      </motion.div>
    )
  }
)

TechCard.displayName = 'TechCard'

'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, TrendingDown, Minus, CheckCircle2, Shield, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TechIcon } from '@/components/shared/TechIcon'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { SubScoreBars } from '@/components/technologies/SubScoreBars'
import { RankChangeBadge } from '@/components/technologies/RankChangeBadge'
import LifecycleBadge from '@/components/technologies/LifecycleBadge'
import QuickCompareLinks from '@/components/technologies/QuickCompareLinks'
import { NumberTicker } from '@/components/ui/number-ticker'
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

    const verdict = useMemo(
      () => generateVerdict(technology.composite_score, technology.momentum, technology.jobs_score, technology.name),
      [technology.composite_score, technology.momentum, technology.jobs_score, technology.name]
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
          className="group block rounded-lg focus:outline-none"
        >
          <div className={`rounded-lg border border-border bg-card/30 p-5 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-card/60 hover:shadow-lg active:translate-y-0 active:shadow-md ${vstyle.border}`}>

            {/* Top row: verdict + lifecycle + category */}
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${vstyle.badgeBg}`}>
                {vstyle.icon}
                {verdict.badge}
              </span>
              <div className="flex items-center gap-1">
                <LifecycleBadge stage={technology.lifecycle_stage} />
                <CategoryBadge category={technology.category} size="sm" />
              </div>
            </div>

            {/* Name + rank */}
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {rank && (
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-sm font-bold text-muted-foreground tabular-nums">#{rank}</span>
                    <RankChangeBadge rankChange={technology.rank_change} />
                  </div>
                )}
                <TechIcon slug={technology.slug} name={technology.name} color={technology.color} size={28} />
                <h3 className="truncate text-[18px] font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                  {technology.name}
                </h3>
              </div>
              <ArrowRight size={15} className="shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>

            {/* Description */}
            <p className="mb-2.5 line-clamp-1 text-sm text-muted-foreground">
              {technology.description}
            </p>

            {/* AI insight quote */}
            {technology.ai_summary && (
              <p className="mb-3.5 line-clamp-2 text-xs italic text-muted-foreground/70">
                &ldquo;{technology.ai_summary}&rdquo;
              </p>
            )}

            {/* Job demand bar */}
            <div className="mb-3.5">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
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
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {momentumIcon}
                {verdict.momentumLabel}
              </span>
              <span className="flex items-center gap-1">
                Score <NumberTicker value={Math.round(technology.composite_score ?? 0)} className="font-medium text-foreground" />
              </span>
              <SubScoreBars
                github={technology.github_score}
                community={technology.community_score}
                jobs={technology.jobs_score}
                ecosystem={technology.ecosystem_score}
              />
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

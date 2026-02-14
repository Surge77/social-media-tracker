'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import { Sparkline } from '@/components/technologies/Sparkline'
import { RankChangeBadge } from '@/components/technologies/RankChangeBadge'
import type { TechnologyWithScore } from '@/types'

interface TechCardProps {
  technology: TechnologyWithScore
  rank?: number
  index?: number
  className?: string
}

export const TechCard = React.forwardRef<HTMLDivElement, TechCardProps>(
  ({ technology, rank, index = 0, className }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    return (
      <motion.div
        ref={ref}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion ? {} : { duration: 0.3, delay: Math.min(index * 0.05, 0.5) }
        }
        className={cn(className)}
      >
        <Link
          href={`/technologies/${technology.slug}`}
          className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <div className="rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50 hover:shadow-lg hover:shadow-primary/5">
            {/* Header: Rank + Name + Score */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {rank && (
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 font-mono text-sm font-semibold text-muted-foreground">
                      {rank}
                    </span>
                    <RankChangeBadge rankChange={technology.rank_change} />
                  </div>
                )}
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: technology.color }}
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {technology.name}
                  </h3>
                </div>
              </div>
              <ScoreBadge score={technology.composite_score} size="lg" />
            </div>

            {/* Status + Category Row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                compositeScore={technology.composite_score}
                momentum={technology.momentum}
                dataCompleteness={technology.data_completeness}
              />
              <CategoryBadge category={technology.category} />
              <MomentumBadge momentum={technology.momentum} />
            </div>

            {/* AI Summary */}
            <p className="mb-3 text-xs text-muted-foreground">
              {technology.ai_summary}
            </p>

            {/* Sparkline */}
            <div className="flex items-center gap-2 rounded border border-border/50 bg-muted/20 p-2">
              <span className="text-xs text-muted-foreground">30-day:</span>
              <Sparkline data={technology.sparkline} width={140} height={24} />
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }
)

TechCard.displayName = 'TechCard'

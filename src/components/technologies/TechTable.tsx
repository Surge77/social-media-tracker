'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { TechIcon } from '@/components/shared/TechIcon'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import { Sparkline } from '@/components/technologies/Sparkline'
import { RankChangeBadge } from '@/components/technologies/RankChangeBadge'
import { AISummaryTooltip } from '@/components/technologies/AISummaryTooltip'
import { getScoreLabel, getMomentumInsight } from '@/lib/insights'
import LifecycleBadge from '@/components/technologies/LifecycleBadge'
import type { TechnologyWithScore } from '@/types'

interface TechTableProps {
  technologies: TechnologyWithScore[]
  className?: string
}

export const TechTable = React.forwardRef<HTMLDivElement, TechTableProps>(
  ({ technologies, className }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const router = useRouter()

    if (technologies.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card/50 p-8',
            className
          )}
        >
          <p className="text-sm text-muted-foreground">No technologies found</p>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-card/30 backdrop-blur-sm',
          className
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Δ
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Technology
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[130px]">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Stage
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Score
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Trend
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  30-Day Chart
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Insight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {technologies.map((tech, index) => (
                <motion.tr
                  key={tech.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={
                    prefersReducedMotion
                      ? {}
                      : { duration: 0.2, delay: Math.min(index * 0.02, 0.3) }
                  }
                  className="tech-row group cursor-pointer"
                  onClick={() => router.push(`/technologies/${tech.slug}`)}
                  style={{ '--tech-color': tech.color } as React.CSSProperties}
                >
                  {/* Rank */}
                  <td className="px-4 py-4 text-center">
                    <span className="font-mono text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  </td>

                  {/* Rank Change */}
                  <td className="px-4 py-4 text-center">
                    <RankChangeBadge rankChange={tech.rank_change} />
                  </td>

                  {/* Technology Name + Category */}
                  <td className="px-4 py-4">
                    <Link
                      href={`/technologies/${tech.slug}`}
                      className="block focus:outline-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={32} />
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="tech-name text-[17px] font-semibold transition-colors duration-150">
                            {tech.name}
                          </span>
                          <span className="flex items-center gap-2">
                            <CategoryBadge category={tech.category} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Status Label */}
                  <td className="px-4 py-4">
                    <StatusBadge
                      compositeScore={tech.composite_score}
                      momentum={tech.momentum}
                      dataCompleteness={tech.data_completeness}
                    />
                  </td>

                  {/* Lifecycle Stage */}
                  <td className="px-4 py-4">
                    <LifecycleBadge stage={tech.lifecycle_stage} />
                  </td>

                  {/* Score with confidence grade chip */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1">
                        <ScoreBadge score={tech.composite_score} confidenceGrade={tech.confidence_grade} />
                        {tech.confidence_grade && (
                          <span className={cn(
                            'text-[11px] font-semibold font-mono px-1 py-0.5 rounded',
                            tech.confidence_grade === 'A' && 'text-emerald-400 bg-emerald-500/10',
                            tech.confidence_grade === 'B' && 'text-blue-400 bg-blue-500/10',
                            tech.confidence_grade === 'C' && 'text-amber-400 bg-amber-500/10',
                            (tech.confidence_grade === 'D' || tech.confidence_grade === 'F') && 'text-slate-400 bg-slate-500/10',
                          )}>
                            {tech.confidence_grade}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getScoreLabel(tech.composite_score)}
                      </span>
                    </div>
                  </td>

                  {/* Momentum with insight */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <MomentumBadge momentum={tech.momentum} />
                      <span className="text-xs text-muted-foreground max-w-[100px] line-clamp-1">
                        {getMomentumInsight(tech.momentum).split(' — ')[0]}
                      </span>
                    </div>
                  </td>

                  {/* Sparkline */}
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <Sparkline data={tech.sparkline} />
                    </div>
                  </td>

                  {/* AI Summary */}
                  <td className="px-4 py-4">
                    <AISummaryTooltip summary={tech.ai_summary} maxLength={55} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

TechTable.displayName = 'TechTable'

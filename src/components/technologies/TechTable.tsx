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
        <div className="divide-y divide-border/50 lg:hidden">
          {technologies.map((tech, index) => (
            <Link
              key={tech.id}
              href={`/technologies/${tech.slug}`}
              className="block px-4 py-3.5 transition-colors hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-1 text-xs font-semibold text-muted-foreground">#{index + 1}</span>
                  <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={28} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{tech.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <CategoryBadge category={tech.category} />
                      <LifecycleBadge stage={tech.lifecycle_stage} />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="inline-flex items-center gap-1">
                    <ScoreBadge score={tech.composite_score} confidenceGrade={tech.confidence_grade} />
                    {tech.confidence_grade && (
                      <span className={cn(
                        'rounded px-1 py-0.5 font-mono text-[10px] font-semibold',
                        tech.confidence_grade === 'A' && 'bg-emerald-500/10 text-emerald-400',
                        tech.confidence_grade === 'B' && 'bg-blue-500/10 text-blue-400',
                        tech.confidence_grade === 'C' && 'bg-amber-500/10 text-amber-400',
                        (tech.confidence_grade === 'D' || tech.confidence_grade === 'F') && 'bg-slate-500/10 text-slate-400'
                      )}>
                        {tech.confidence_grade}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1.5">
                    <RankChangeBadge rankChange={tech.rank_change} />
                    <MomentumBadge momentum={tech.momentum} />
                  </div>
                </div>
              </div>

              <p className="mt-2.5 line-clamp-2 text-xs text-muted-foreground">
                {tech.ai_summary || getMomentumInsight(tech.momentum)}
              </p>
            </Link>
          ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Delta
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Technology
                </th>
                <th className="min-w-[130px] px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                  <td className="px-4 py-4 text-center">
                    <span className="font-mono text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <RankChangeBadge rankChange={tech.rank_change} />
                  </td>

                  <td className="px-4 py-4">
                    <Link
                      href={`/technologies/${tech.slug}`}
                      className="block focus:outline-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={32} />
                        <div className="min-w-0 flex flex-col gap-1">
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

                  <td className="px-4 py-4">
                    <StatusBadge
                      compositeScore={tech.composite_score}
                      momentum={tech.momentum}
                      dataCompleteness={tech.data_completeness}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <LifecycleBadge stage={tech.lifecycle_stage} />
                  </td>

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

                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <MomentumBadge momentum={tech.momentum} />
                      <span className="max-w-[100px] line-clamp-1 text-xs text-muted-foreground">
                        {getMomentumInsight(tech.momentum)}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <Sparkline data={tech.sparkline} />
                    </div>
                  </td>

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

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
import { getScoreLabel, getMomentumInsight } from '@/lib/insights'
import type { TechnologyWithScore } from '@/types'

interface TechTableProps {
  technologies: TechnologyWithScore[]
  className?: string
}

export const TechTable = React.forwardRef<HTMLDivElement, TechTableProps>(
  ({ technologies, className }, ref) => {
    const prefersReducedMotion = useReducedMotion()

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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Technology
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Score
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Trend
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  30-Day Chart
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
                  className="group cursor-pointer transition-colors hover:bg-muted/20"
                >
                  {/* Rank */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono text-sm text-muted-foreground">
                      {index + 1}
                    </span>
                  </td>

                  {/* Technology Name + Category */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/technologies/${tech.slug}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <div className="flex items-center gap-3">
                        {/* Color dot */}
                        <div
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: tech.color }}
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
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
                  <td className="px-4 py-3">
                    <StatusBadge
                      compositeScore={tech.composite_score}
                      momentum={tech.momentum}
                      dataCompleteness={tech.data_completeness}
                    />
                  </td>

                  {/* Score with label */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <ScoreBadge score={tech.composite_score} />
                      <span className="text-[10px] text-muted-foreground">
                        {getScoreLabel(tech.composite_score)}
                      </span>
                    </div>
                  </td>

                  {/* Momentum with insight */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <MomentumBadge momentum={tech.momentum} />
                      <span className="text-[10px] text-muted-foreground max-w-[100px] line-clamp-1">
                        {getMomentumInsight(tech.momentum).split(' — ')[0]}
                      </span>
                    </div>
                  </td>

                  {/* Sparkline */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Sparkline data={tech.sparkline} />
                    </div>
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

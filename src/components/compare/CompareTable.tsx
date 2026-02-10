'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import type { TechnologyWithScore } from '@/types'

interface CompareTableProps {
  technologies: TechnologyWithScore[]
  className?: string
}

interface MetricRow {
  label: string
  getValue: (tech: TechnologyWithScore) => string | number | React.ReactNode
  format?: (value: any) => string
}

export const CompareTable = React.forwardRef<HTMLDivElement, CompareTableProps>(
  ({ technologies, className }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    if (technologies.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex min-h-[300px] items-center justify-center rounded-lg border border-border bg-card/30 p-8',
            className
          )}
        >
          <p className="text-sm text-muted-foreground">No technologies selected</p>
        </div>
      )
    }

    const formatNumber = (num: number | null) => {
      if (num === null) return 'N/A'
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
      return num.toLocaleString()
    }

    const metrics: MetricRow[] = [
      {
        label: 'Composite Score',
        getValue: (tech) => <ScoreBadge score={tech.composite_score} size="md" />,
      },
      {
        label: 'Momentum',
        getValue: (tech) => <MomentumBadge momentum={tech.momentum} size="md" />,
      },
      {
        label: 'GitHub Score',
        getValue: (tech) => tech.github_score ?? 'N/A',
        format: (val) => (typeof val === 'number' ? Math.round(val).toString() : val),
      },
      {
        label: 'Community Score',
        getValue: (tech) => tech.community_score ?? 'N/A',
        format: (val) => (typeof val === 'number' ? Math.round(val).toString() : val),
      },
      {
        label: 'Jobs Score',
        getValue: (tech) => tech.jobs_score ?? 'N/A',
        format: (val) => (typeof val === 'number' ? Math.round(val).toString() : val),
      },
      {
        label: 'Ecosystem Score',
        getValue: (tech) => tech.ecosystem_score ?? 'N/A',
        format: (val) => (typeof val === 'number' ? Math.round(val).toString() : val),
      },
      {
        label: 'Data Confidence',
        getValue: (tech) => {
          const pct = tech.data_completeness ? Math.round(tech.data_completeness * 100) : 0
          return `${pct}%`
        },
      },
    ]

    return (
      <motion.div
        ref={ref}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
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
                  Metric
                </th>
                {technologies.map((tech) => (
                  <th
                    key={tech.id}
                    className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    <Link
                      href={`/technologies/${tech.slug}`}
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      {tech.name}
                      <ExternalLink size={12} />
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {metrics.map((metric, index) => (
                <motion.tr
                  key={metric.label}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={
                    prefersReducedMotion ? {} : { duration: 0.2, delay: index * 0.05 }
                  }
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {metric.label}
                  </td>
                  {technologies.map((tech) => {
                    const value = metric.getValue(tech)
                    const displayValue = React.isValidElement(value)
                      ? value
                      : metric.format
                        ? metric.format(value)
                        : value

                    return (
                      <td
                        key={tech.id}
                        className="px-4 py-3 text-center text-sm font-mono text-foreground"
                      >
                        {displayValue}
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    )
  }
)

CompareTable.displayName = 'CompareTable'

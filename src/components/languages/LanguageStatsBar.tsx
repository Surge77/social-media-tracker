'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Briefcase, BarChart2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LANG_COLORS } from '@/components/languages/constants'
import type { LanguageRanking } from '@/components/languages/LanguageRow'

interface LanguageStatsBarProps {
  rankings: LanguageRanking[]
}

export function LanguageStatsBar({ rankings }: LanguageStatsBarProps) {
  const prefersReducedMotion = useReducedMotion()
  if (rankings.length === 0) return null

  const top = rankings[0]
  const topColor = LANG_COLORS[top.language] ?? '#6b7280'

  const biggestMover = rankings
    .filter((r) => r.prev_rank !== null && r.prev_rank - r.rank > 0)
    .sort((a, b) => (b.prev_rank! - b.rank) - (a.prev_rank! - a.rank))[0] ?? null

  const mostJobs = rankings.reduce((best, r) =>
    r.job_listings > best.job_listings ? r : best, rankings[0])

  const stats = [
    {
      icon: Trophy,
      label: 'Top Language',
      value: top.language,
      sub: `Rating: 100`,
      color: topColor,
    },
    {
      icon: TrendingUp,
      label: 'Biggest Mover',
      value: biggestMover ? biggestMover.language : '—',
      sub: biggestMover
        ? `↑${biggestMover.prev_rank! - biggestMover.rank} places`
        : 'No changes yet',
      color: biggestMover ? (LANG_COLORS[biggestMover.language] ?? '#10b981') : '#6b7280',
    },
    {
      icon: Briefcase,
      label: 'Most Job Demand',
      value: mostJobs.language,
      sub: `${mostJobs.job_listings.toLocaleString()} listings`,
      color: LANG_COLORS[mostJobs.language] ?? '#6b7280',
    },
    {
      icon: BarChart2,
      label: 'Languages Tracked',
      value: String(rankings.length),
      sub: 'across all categories',
      color: '#6366f1',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.35, delay: i * 0.07 }}
          className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-4 py-3"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${stat.color}18` }}
          >
            <stat.icon size={16} style={{ color: stat.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="truncate text-sm font-bold text-foreground">{stat.value}</p>
            <p className="truncate text-[10px] text-muted-foreground">{stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

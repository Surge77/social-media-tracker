'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, TrendingUp, Shield, Gem, AlertTriangle, Grid } from 'lucide-react'
import type { TechnologyWithScore } from '@/types'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { BorderBeam } from '@/components/ui/border-beam'

export type SmartFilter =
  | 'all'
  | 'career-switch'
  | 'rising-stars'
  | 'safe-bets'
  | 'hidden-gems'
  | 'overhyped'

interface SmartFilterConfig {
  id: SmartFilter
  label: string
  icon: React.ElementType
  description: string
  filter: (tech: TechnologyWithScore) => boolean
  sort: (a: TechnologyWithScore, b: TechnologyWithScore) => number
  emptyMessage: string
}

export const SMART_FILTERS: SmartFilterConfig[] = [
  {
    id: 'all',
    label: 'All',
    icon: Grid,
    description: 'All technologies',
    filter: () => true,
    sort: (a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0),
    emptyMessage: 'No technologies found.',
  },
  {
    id: 'career-switch',
    label: 'Career Switch',
    icon: Rocket,
    description: 'High jobs + rising momentum -> learn this now',
    filter: (t) =>
      (t.jobs_score ?? 0) >= 55 &&
      (t.momentum ?? 0) > 5 &&
      (t.composite_score ?? 0) >= 46.5,
    sort: (a, b) => {
      const scoreA = (a.jobs_score ?? 0) * 0.6 + (a.momentum ?? 0) * 0.4
      const scoreB = (b.jobs_score ?? 0) * 0.6 + (b.momentum ?? 0) * 0.4
      return scoreB - scoreA
    },
    emptyMessage: 'No technologies match career-switch criteria right now.',
  },
  {
    id: 'rising-stars',
    label: 'Rising Stars',
    icon: TrendingUp,
    description: 'Strong positive momentum -> early adoption opportunity',
    filter: (t) => (t.momentum ?? 0) > 10,
    sort: (a, b) => (b.momentum ?? 0) - (a.momentum ?? 0),
    emptyMessage: 'No technologies with strong upward momentum right now.',
  },
  {
    id: 'safe-bets',
    label: 'Safe Bets',
    icon: Shield,
    description: 'Strong job demand + stable momentum -> reliable career skill',
    filter: (t) =>
      (t.jobs_score ?? 0) >= 60 &&
      Math.abs(t.momentum ?? 0) <= 5 &&
      (t.composite_score ?? 0) >= 46,
    sort: (a, b) => (b.jobs_score ?? 0) - (a.jobs_score ?? 0),
    emptyMessage: 'No technologies match safe-bet criteria right now.',
  },
  {
    id: 'hidden-gems',
    label: 'Hidden Gems',
    icon: Gem,
    description: 'Strong hiring signal outside the mainstream top ranks -> lower competition',
    filter: (t) =>
      (t.jobs_score ?? 0) >= 55 &&
      ((t.jobs_score ?? 0) - (t.composite_score ?? 0)) >= 12 &&
      (t.rank ?? Number.POSITIVE_INFINITY) > 15 &&
      (t.momentum ?? 0) >= -2,
    sort: (a, b) => {
      const gapA = (a.jobs_score ?? 0) - (a.composite_score ?? 0)
      const gapB = (b.jobs_score ?? 0) - (b.composite_score ?? 0)
      if (gapB !== gapA) return gapB - gapA
      return (b.jobs_score ?? 0) - (a.jobs_score ?? 0)
    },
    emptyMessage: 'No hidden gems found right now.',
  },
  {
    id: 'overhyped',
    label: 'Overhyped?',
    icon: AlertTriangle,
    description: 'Community buzz far exceeds hiring reality -> excitement may be outrunning demand',
    filter: (t) =>
      (t.community_score ?? 0) >= 50 &&
      (t.jobs_score ?? 0) <= 35 &&
      ((t.community_score ?? 0) - (t.jobs_score ?? 0)) >= 15 &&
      (t.momentum ?? 0) <= 5,
    sort: (a, b) => {
      const gapA = (a.community_score ?? 0) - (a.jobs_score ?? 0)
      const gapB = (b.community_score ?? 0) - (b.jobs_score ?? 0)
      if (gapB !== gapA) return gapB - gapA
      return (a.momentum ?? 0) - (b.momentum ?? 0)
    },
    emptyMessage: 'No technologies show signs of hype outrunning real demand right now.',
  },
]

interface SmartFiltersProps {
  activeFilter: SmartFilter
  onFilterChange: (filter: SmartFilter) => void
}

export function SmartFilters({ activeFilter, onFilterChange }: SmartFiltersProps) {
  const activeDescription = SMART_FILTERS.find((filter) => filter.id === activeFilter)?.description
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="app-section-tight">
      <div className="app-chip-scroll">
        {SMART_FILTERS.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.id

          return (
            <motion.button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={cn(
                'relative tap-target shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all overflow-hidden',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'border border-border/60 bg-card/45 text-secondary-foreground hover:border-primary/30 hover:bg-card/70'
              )}
              title={filter.description}
            >
              {/* Border beam on active chip */}
              {isActive && !prefersReducedMotion && (
                <BorderBeam size={80} duration={6} colorFrom="#f97316" colorTo="#f59e0b" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {activeFilter !== 'all' && activeDescription && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-border/60 bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Showing:</span> {activeDescription}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function applySmartFilter(
  technologies: TechnologyWithScore[],
  filterId: SmartFilter
): TechnologyWithScore[] {
  const config = SMART_FILTERS.find((f) => f.id === filterId)
  if (!config) return technologies

  const filtered = technologies.filter(config.filter)
  return filtered.sort(config.sort)
}

export function getFilterEmptyMessage(filterId: SmartFilter): string {
  const config = SMART_FILTERS.find((f) => f.id === filterId)
  return config?.emptyMessage ?? 'No technologies found.'
}

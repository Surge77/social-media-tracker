'use client'

import React from 'react'
import { Rocket, TrendingUp, Shield, Gem, AlertTriangle, Grid } from 'lucide-react'
import type { TechnologyWithScore } from '@/types'
import { cn } from '@/lib/utils'

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
    description: 'High jobs + rising momentum → learn this NOW',
    filter: (t) =>
      (t.jobs_score ?? 0) >= 55 &&
      (t.momentum ?? 0) > 5 &&
      (t.composite_score ?? 0) >= 46.5,
    sort: (a, b) => {
      // Sort by (jobs_score * 0.6 + momentum * 0.4) — career impact score
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
    description: 'Strong positive momentum — early adoption opportunity',
    filter: (t) => (t.momentum ?? 0) > 10,
    sort: (a, b) => (b.momentum ?? 0) - (a.momentum ?? 0),
    emptyMessage: 'No technologies with strong upward momentum right now.',
  },
  {
    id: 'safe-bets',
    label: 'Safe Bets',
    icon: Shield,
    description: 'Strong job demand + stable momentum — reliable career skill',
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
    description: 'Strong job demand but undervalued overall score — less competition',
    filter: (t) =>
      (t.jobs_score ?? 0) >= 50 &&
      (t.composite_score ?? 0) < 46.5 &&
      (t.momentum ?? 0) > 0,
    sort: (a, b) => {
      // Sort by jobs vs composite gap (high jobs but low overall = most hidden)
      const gapA = (a.jobs_score ?? 0) - (a.composite_score ?? 0)
      const gapB = (b.jobs_score ?? 0) - (b.composite_score ?? 0)
      return gapB - gapA
    },
    emptyMessage: 'No hidden gems found right now.',
  },
  {
    id: 'overhyped',
    label: 'Overhyped?',
    icon: AlertTriangle,
    description: 'Established tech losing momentum — may be past its peak',
    filter: (t) =>
      (t.community_score ?? 0) >= 55 &&
      (t.jobs_score ?? 0) < 35 &&
      (t.momentum ?? 0) < -3,
    sort: (a, b) => (a.momentum ?? 0) - (b.momentum ?? 0), // Most negative first
    emptyMessage: 'No technologies show signs of declining momentum right now.',
  },
]

interface SmartFiltersProps {
  activeFilter: SmartFilter
  onFilterChange: (filter: SmartFilter) => void
}

export function SmartFilters({ activeFilter, onFilterChange }: SmartFiltersProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {SMART_FILTERS.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.id

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                'group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
              title={filter.description}
            >
              <Icon className="h-4 w-4" />
              <span>{filter.label}</span>

              {/* Tooltip on hover */}
              {!isActive && (
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-lg group-hover:block">
                  {filter.description}
                  <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Active filter description */}
      {activeFilter !== 'all' && (
        <div className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium">Showing: </span>
          {SMART_FILTERS.find(f => f.id === activeFilter)?.description}
        </div>
      )}
    </div>
  )
}

/**
 * Apply smart filter to technologies array
 */
export function applySmartFilter(
  technologies: TechnologyWithScore[],
  filterId: SmartFilter
): TechnologyWithScore[] {
  const config = SMART_FILTERS.find(f => f.id === filterId)
  if (!config) return technologies

  const filtered = technologies.filter(config.filter)
  return filtered.sort(config.sort)
}

/**
 * Get empty message for a filter
 */
export function getFilterEmptyMessage(filterId: SmartFilter): string {
  const config = SMART_FILTERS.find(f => f.id === filterId)
  return config?.emptyMessage ?? 'No technologies found.'
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechStatsResponse } from '@/hooks/useTechStats'
import type { TechnologyCategory } from '@/types'

interface CategoryHealthProps {
  data: TechStatsResponse['category_health'] | null
  isLoading: boolean
  isError: boolean
  onCategoryClick: (category: TechnologyCategory) => void
}

type TrendLabel = 'Booming' | 'Growing' | 'Stable' | 'Mature' | 'Cooling'

const TREND_STYLES: Record<TrendLabel, { label: string; badge: string; arrow: string }> = {
  Booming: {
    label: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400',
    arrow: '↗',
  },
  Growing: {
    label: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400',
    arrow: '↗',
  },
  Stable: {
    label: 'text-muted-foreground',
    badge: 'bg-muted/50 text-muted-foreground',
    arrow: '→',
  },
  Mature: {
    label: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400',
    arrow: '→',
  },
  Cooling: {
    label: 'text-red-400',
    badge: 'bg-red-500/10 text-red-400',
    arrow: '↘',
  },
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-card/60 p-3 min-w-[96px]">
      <div className="h-3 w-14 animate-pulse rounded bg-muted" />
      <div className="h-4 w-8 animate-pulse rounded bg-muted" />
      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
      <div className="h-3 w-12 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function CategoryHealth({
  data,
  isLoading,
  isError,
  onCategoryClick,
}: CategoryHealthProps) {
  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-x-visible lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Unable to load category health data.
      </div>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-x-visible lg:grid-cols-4 xl:grid-cols-5">
      {data.map((item, index) => {
        const trend = TREND_STYLES[item.trend_label as TrendLabel] ?? TREND_STYLES.Stable
        const momentumSign = item.avg_momentum >= 0 ? '+' : ''

        return (
          <motion.button
            key={item.category}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.92 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={
              prefersReducedMotion
                ? {}
                : { duration: 0.25, delay: index * 0.05, ease: 'easeOut' }
            }
            onClick={() => onCategoryClick(item.category)}
            className={cn(
              'flex min-w-[96px] flex-col gap-1.5 rounded-lg border border-border/50 bg-card/60 p-3 text-left',
              'cursor-pointer transition-all duration-150',
              'hover:border-border hover:bg-card hover:shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
            )}
            aria-label={`Filter by ${item.label}`}
          >
            {/* Category label */}
            <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </span>

            {/* Tech count */}
            <span className="text-lg font-bold leading-none text-foreground">
              {item.count}
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">techs</span>
            </span>

            {/* Momentum */}
            <div className="flex items-center gap-1">
              <span className={cn('text-sm font-medium', trend.label)}>
                {trend.arrow}
              </span>
              <span className={cn('text-xs', trend.label)}>
                {momentumSign}
                {item.avg_momentum.toFixed(1)}
              </span>
            </div>

            {/* Trend badge */}
            <span
              className={cn(
                'inline-block self-start rounded px-1.5 py-0.5 text-[10px] font-semibold',
                trend.badge
              )}
            >
              {item.trend_label}
            </span>

            {/* Best tech */}
            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
              Best:{' '}
              <Link
                href={`/technologies/${item.best_tech.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.best_tech.name}
              </Link>{' '}
              <span className="text-muted-foreground/70">{item.best_tech.score.toFixed(0)}</span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechStatsResponse } from '@/hooks/useTechStats'

interface ScoreDistributionProps {
  data: TechStatsResponse['score_distribution'] | null
  isLoading: boolean
  isError: boolean
}

const BAR_MAX_HEIGHT = 60 // px

/**
 * Maps bucket index (0 = lowest score, 9 = highest) to a CSS color.
 * Gradient: red → orange → yellow → lime → emerald
 */
function bucketColor(index: number, total: number): string {
  const ratio = total <= 1 ? 1 : index / (total - 1)

  if (ratio < 0.2) return 'rgb(239, 68, 68)'   // red-500
  if (ratio < 0.4) return 'rgb(249, 115, 22)'  // orange-500
  if (ratio < 0.6) return 'rgb(234, 179, 8)'   // yellow-500
  if (ratio < 0.8) return 'rgb(132, 204, 22)'  // lime-500
  return 'rgb(16, 185, 129)'                    // emerald-500
}

function SkeletonBars() {
  return (
    <div className="flex items-end gap-1 h-[60px]">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t bg-muted"
          style={{ height: `${20 + Math.sin(i) * 20 + 20}px` }}
        />
      ))}
    </div>
  )
}

export function ScoreDistribution({ data, isLoading, isError }: ScoreDistributionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [tooltip, setTooltip] = useState<{ bucket: string; count: number; index: number } | null>(
    null
  )

  const maxCount = data ? Math.max(...data.map((d) => d.count), 1) : 1

  const peakBucket = data
    ? data.reduce((best, cur) => (cur.count > best.count ? cur : best), data[0])
    : null

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number] },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-sm p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Score Distribution
        </span>
        {peakBucket && !isLoading && !isError && (
          <span className="text-[11px] text-muted-foreground">
            Most techs score{' '}
            <span className="font-medium text-foreground">{peakBucket.bucket}</span>
          </span>
        )}
      </div>

      {/* Chart area */}
      {isLoading ? (
        <SkeletonBars />
      ) : isError ? (
        <div className="flex h-[60px] items-center justify-center text-sm text-muted-foreground">
          Unable to load distribution data.
        </div>
      ) : data && data.length > 0 ? (
        <div className="relative">
          {/* Tooltip */}
          {tooltip && (
            <div
              className={cn(
                'pointer-events-none absolute z-10 -top-9 rounded border border-border bg-popover px-2 py-1',
                'text-[11px] font-medium text-popover-foreground shadow-md whitespace-nowrap',
                'transform -translate-x-1/2'
              )}
              style={{
                left: `${((tooltip.index + 0.5) / data.length) * 100}%`,
              }}
            >
              {tooltip.bucket}: {tooltip.count} {tooltip.count === 1 ? 'tech' : 'techs'}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
            </div>
          )}

          {/* Bars */}
          <div className="flex items-end gap-0.5" style={{ height: `${BAR_MAX_HEIGHT}px` }}>
            {data.map((bucket, index) => {
              const heightPx =
                bucket.count === 0
                  ? 2
                  : Math.max(4, Math.round((bucket.count / maxCount) * BAR_MAX_HEIGHT))
              const color = bucketColor(index, data.length)

              return (
                <motion.div
                  key={bucket.bucket}
                  className="relative flex-1 cursor-pointer rounded-t transition-opacity hover:opacity-80"
                  style={{
                    height: prefersReducedMotion ? `${heightPx}px` : undefined,
                    backgroundColor: color,
                    minWidth: 0,
                  }}
                  initial={prefersReducedMotion ? {} : { height: 0 }}
                  animate={prefersReducedMotion ? {} : { height: heightPx }}
                  transition={
                    prefersReducedMotion
                      ? {}
                      : { duration: 0.4, delay: index * 0.03, ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number] }
                  }
                  onMouseEnter={() =>
                    setTooltip({ bucket: bucket.bucket, count: bucket.count, index })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  onFocus={() =>
                    setTooltip({ bucket: bucket.bucket, count: bucket.count, index })
                  }
                  onBlur={() => setTooltip(null)}
                  role="img"
                  aria-label={`${bucket.bucket}: ${bucket.count} technologies`}
                  tabIndex={0}
                />
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground/70 select-none">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      ) : (
        <div className="flex h-[60px] items-center justify-center text-sm text-muted-foreground">
          No distribution data available.
        </div>
      )}
    </motion.div>
  )
}

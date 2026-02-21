'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechStatsResponse } from '@/hooks/useTechStats'

interface MarketPulseProps {
  data: TechStatsResponse['market_pulse'] | null
  isLoading: boolean
  isError: boolean
}

function SkeletonSlot() {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      <div className="h-3 w-12 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function MarketPulse({ data, isLoading, isError }: MarketPulseProps) {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number] },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'rounded-xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40',
        'backdrop-blur-sm shadow-sm overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Today&apos;s Market Pulse
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid grid-cols-2 divide-x divide-y divide-border/30 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonSlot key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          Unable to load market pulse data.
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 divide-border/30 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x [&>*]:border-b [&>*]:border-border/30 lg:[&>*]:border-b-0">
          {/* Hottest */}
          <SlotItem
            emoji="🔥"
            label="Hottest"
            content={
              data.hottest ? (
                <>
                  <Link
                    href={`/technologies/${data.hottest.slug}`}
                    className="truncate font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {data.hottest.name}
                  </Link>
                  <span className="text-xs font-medium text-emerald-400">
                    +{data.hottest.score_delta.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )
            }
          />

          {/* Most Demanded */}
          <SlotItem
            emoji="📈"
            label="Most Demanded"
            content={
              data.most_demanded ? (
                <>
                  <Link
                    href={`/technologies/${data.most_demanded.slug}`}
                    className="truncate font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {data.most_demanded.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {data.most_demanded.jobs_score.toFixed(0)} jobs score
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )
            }
          />

          {/* Cooling */}
          <SlotItem
            emoji="📉"
            label="Cooling"
            content={
              data.cooling ? (
                <>
                  <Link
                    href={`/technologies/${data.cooling.slug}`}
                    className="truncate font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {data.cooling.name}
                  </Link>
                  <span className="text-xs font-medium text-red-400">
                    {data.cooling.score_delta.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )
            }
          />

          {/* Hidden Gem */}
          <SlotItem
            emoji="💎"
            label="Hidden Gem"
            content={
              data.hidden_gem ? (
                <Link
                  href={`/technologies/${data.hidden_gem.slug}`}
                  className="truncate font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {data.hidden_gem.name}
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )
            }
          />

          {/* Trending */}
          <SlotItem
            emoji="⚡"
            label="Trending"
            content={
              data.trending.length > 0 ? (
                <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                  {data.trending.slice(0, 3).map((tech, idx) => (
                    <React.Fragment key={tech.slug}>
                      <Link
                        href={`/technologies/${tech.slug}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {tech.name}
                      </Link>
                      {idx < Math.min(data.trending.length, 3) - 1 && (
                        <span className="text-muted-foreground/50 text-sm">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )
            }
          />

          {/* Safest Bet */}
          <SlotItem
            emoji="🛡️"
            label="Safest Bet"
            content={
              data.safest_bet ? (
                <Link
                  href={`/technologies/${data.safest_bet.slug}`}
                  className="truncate font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {data.safest_bet.name}
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )
            }
          />
        </div>
      ) : null}
    </motion.div>
  )
}

interface SlotItemProps {
  emoji: string
  label: string
  content: React.ReactNode
}

function SlotItem({ emoji, label, content }: SlotItemProps) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{emoji}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">{content}</div>
    </div>
  )
}

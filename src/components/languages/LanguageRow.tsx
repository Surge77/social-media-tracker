'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { RankChangeBadge } from '@/components/languages/RankChangeBadge'
import { LANG_COLORS, fmt } from '@/components/languages/constants'

export interface LanguageRanking {
  id: number
  language: string
  rank: number
  prev_rank: number | null
  github_repos_count: number
  stackoverflow_questions: number
  job_listings: number
  popularity_index: number
  snapshot_date: string
}

export type MarketFit = 'high' | 'competitive' | 'niche'

interface LanguageRowProps {
  ranking: LanguageRanking
  maxIndex: number
  maxGithub: number
  maxSO: number
  maxJobs: number
  marketFit: MarketFit
  animationDelay?: number
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const MARKET_FIT_CONFIG: Record<MarketFit, { label: string; color: string; bg: string; desc: string }> = {
  high:        { label: 'High Demand',  color: '#10b981', bg: 'bg-emerald-500/10', desc: 'More jobs per popularity point than most tracked languages — employer demand is strong.' },
  competitive: { label: 'Competitive',  color: '#f59e0b', bg: 'bg-amber-500/10',   desc: 'Solid job market but also a large developer pool — competition for roles is real.' },
  niche:       { label: 'Niche',        color: '#6b7280', bg: 'bg-muted',           desc: 'Big community relative to job listings — fewer employer roles, more specialised market.' },
}

export function LanguageRow({
  ranking,
  maxIndex,
  maxGithub,
  maxSO,
  maxJobs,
  marketFit,
  animationDelay = 0,
}: LanguageRowProps) {
  const color    = LANG_COLORS[ranking.language] ?? '#6b7280'
  const relIndex = maxIndex > 0 ? Math.round((ranking.popularity_index / maxIndex) * 100) : 0
  const isTop10  = ranking.rank <= 10
  const isTop3   = ranking.rank <= 3
  const medal    = MEDALS[ranking.rank]
  const mf       = MARKET_FIT_CONFIG[marketFit]

  const [isExpanded, setIsExpanded] = React.useState(false)
  const [barReady, setBarReady] = React.useState(false)
  const [expandBarReady, setExpandBarReady] = React.useState(false)

  // Main bar animation on mount
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setBarReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Expand bar animation when section opens
  React.useEffect(() => {
    if (isExpanded) {
      const id = requestAnimationFrame(() => setExpandBarReady(true))
      return () => cancelAnimationFrame(id)
    } else {
      setExpandBarReady(false)
    }
  }, [isExpanded])

  const metrics = [
    { label: 'GitHub repos',   weight: '40%', value: ranking.github_repos_count,    max: maxGithub, color: '#6b8cde' },
    { label: 'Stack Overflow', weight: '40%', value: ranking.stackoverflow_questions, max: maxSO,     color: '#e8a838' },
    { label: 'Job listings',   weight: '20%', value: ranking.job_listings,            max: maxJobs,   color: '#5ab56e' },
  ]

  return (
    <div
      className="rounded-lg border bg-card/30 transition-colors hover:bg-card/50"
      style={{
        borderColor: isTop3 ? `${color}35` : undefined,
        borderLeftColor: isTop10 ? color : undefined,
        borderLeftWidth: isTop10 ? 2 : undefined,
      }}
    >
      {/* Main row — clickable to expand */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
      >
        {/* Rank / medal */}
        <div className="w-7 shrink-0 text-center">
          {medal ? (
            <span className="text-base leading-none">{medal}</span>
          ) : (
            <span className="font-mono text-sm font-bold tabular-nums text-foreground">
              {ranking.rank}
            </span>
          )}
        </div>

        {/* Rank change */}
        <div className="w-10 shrink-0">
          <RankChangeBadge rank={ranking.rank} prevRank={ranking.prev_rank} />
        </div>

        {/* Language name */}
        <div className="flex w-32 shrink-0 items-center gap-2 sm:w-36">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: isTop10 ? `0 0 6px ${color}60` : undefined,
            }}
          />
          <span className="truncate text-sm font-semibold text-foreground">
            {ranking.language}
          </span>
        </div>

        {/* Rating bar */}
        <div className="flex flex-1 items-center gap-2.5 min-w-0">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: barReady ? `${relIndex}%` : '0%',
                backgroundColor: color,
                opacity: 0.75,
                transition: `width 700ms cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}ms`,
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
            {relIndex}
          </span>
        </div>

        {/* GitHub */}
        <div className="hidden w-16 shrink-0 text-right md:block">
          <p className="text-[10px] text-muted-foreground">GitHub</p>
          <p className="text-xs font-medium tabular-nums text-foreground">
            {fmt(ranking.github_repos_count)}
          </p>
        </div>

        {/* Stack Overflow */}
        <div className="hidden w-16 shrink-0 text-right lg:block">
          <p className="text-[10px] text-muted-foreground">S.O. Q&apos;s</p>
          <p className="text-xs font-medium tabular-nums text-foreground">
            {fmt(ranking.stackoverflow_questions)}
          </p>
        </div>

        {/* Jobs */}
        <div className="w-16 shrink-0 text-right">
          <p className="text-[10px] text-muted-foreground">Jobs</p>
          <p className="text-xs font-medium tabular-nums text-foreground">
            {fmt(ranking.job_listings)}
          </p>
        </div>

        {/* Market fit badge */}
        <div className="hidden w-20 shrink-0 items-center justify-end lg:flex">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${mf.bg}`}
            style={{ color: mf.color }}
          >
            {mf.label}
          </span>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          size={14}
          className="shrink-0 text-muted-foreground/50 transition-transform duration-200"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 px-4 pb-4 pt-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">

                {/* Metric bars */}
                <div className="flex-1 space-y-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Metric breakdown
                  </p>
                  {metrics.map((m) => {
                    const pct = m.max > 0 ? (m.value / m.max) * 100 : 0
                    return (
                      <div key={m.label}>
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground">{m.label}</span>
                            <span className="text-[10px] text-muted-foreground">({m.weight})</span>
                          </div>
                          <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                            {fmt(m.value)}
                          </span>
                        </div>
                        <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              width: expandBarReady ? `${pct}%` : '0%',
                              backgroundColor: m.color,
                              opacity: 0.8,
                              transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Market fit */}
                <div className="w-full rounded-lg border border-border/60 bg-muted/20 p-3 sm:w-56">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Market fit
                  </p>
                  <span
                    className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${mf.bg}`}
                    style={{ color: mf.color }}
                  >
                    {mf.label}
                  </span>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{mf.desc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

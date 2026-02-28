'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { RankChangeBadge } from '@/components/languages/RankChangeBadge'
import { LanguageIcon } from '@/components/languages/LanguageIcon'
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
      className={`group rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-card shadow-sm border-border' : 'bg-card/30 hover:bg-card border-transparent hover:shadow-sm'}`}
      style={{
        borderLeftColor: isTop10 ? color : undefined,
        borderLeftWidth: isTop10 ? 3 : 1,
      }}
    >
      {/* Main row — clickable to expand */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        {/* Rank / medal */}
        <div className="w-8 shrink-0 text-center">
          {medal ? (
            <span className="text-2xl leading-none drop-shadow-sm">{medal}</span>
          ) : (
            <span className="font-mono text-base font-extrabold tabular-nums text-foreground/80 group-hover:text-foreground transition-colors">
              {ranking.rank}
            </span>
          )}
        </div>

        {/* Rank change */}
        <div className="w-10 shrink-0">
          <RankChangeBadge rank={ranking.rank} prevRank={ranking.prev_rank} />
        </div>

        {/* Language name + Logo */}
        <div className="flex w-36 shrink-0 items-center gap-3 sm:w-40">
          <div className="shrink-0 transition-transform group-hover:scale-110">
            <LanguageIcon language={ranking.language} size={28} />
          </div>
          <span className="truncate text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
            {ranking.language}
          </span>
        </div>

        {/* Rating bar */}
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted/80">
            <div
              className="absolute inset-y-0 left-0 rounded-full group-hover:brightness-110 transition-all"
              style={{
                width: barReady ? `${relIndex}%` : '0%',
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}40`,
                transition: `width 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationDelay}ms`,
              }}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-sm font-extrabold tabular-nums text-foreground group-hover:text-foreground transition-colors">
            {relIndex}
          </span>
        </div>

        {/* GitHub */}
        <div className="hidden w-20 shrink-0 text-right md:block">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">GitHub</p>
          <p className="text-sm font-bold tabular-nums text-foreground group-hover:text-foreground transition-colors">
            {fmt(ranking.github_repos_count)}
          </p>
        </div>

        {/* Stack Overflow */}
        <div className="hidden w-20 shrink-0 text-right lg:block">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">S.O. Q&apos;s</p>
          <p className="text-sm font-bold tabular-nums text-foreground group-hover:text-foreground transition-colors">
            {fmt(ranking.stackoverflow_questions)}
          </p>
        </div>

        {/* Jobs */}
        <div className="w-20 shrink-0 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">Jobs</p>
          <p className="text-sm font-bold tabular-nums text-foreground group-hover:text-foreground transition-colors">
            {fmt(ranking.job_listings)}
          </p>
        </div>

        {/* Market fit badge */}
        <div className="hidden w-24 shrink-0 items-center justify-end lg:flex">
          <span
            className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide transition-transform group-hover:scale-105 ${mf.bg}`}
            style={{ color: mf.color }}
          >
            {mf.label}
          </span>
        </div>

        {/* Expand chevron */}
        <div className={`shrink-0 rounded-full p-1 transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground/50 group-hover:bg-muted group-hover:text-foreground'}`}>
          <ChevronDown
            size={16}
            className="transition-transform duration-300"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 px-4 pb-5 pt-4 bg-muted/10 rounded-b-xl">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8">

                {/* Metric bars */}
                <div className="flex-1 space-y-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Metric Breakdown
                  </p>
                  <div className="space-y-3">
                    {metrics.map((m) => {
                      const pct = m.max > 0 ? (m.value / m.max) * 100 : 0
                      return (
                        <div key={m.label} className="group/metric">
                          <div className="mb-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">{m.label}</span>
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">{m.weight}</span>
                            </div>
                            <span className="font-mono text-xs font-bold tabular-nums text-foreground group-hover/metric:text-primary transition-colors">
                              {fmt(m.value)}
                            </span>
                          </div>
                          <div className="relative h-2 overflow-hidden rounded-full bg-muted/80">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                width: expandBarReady ? `${pct}%` : '0%',
                                backgroundColor: m.color,
                                boxShadow: `0 0 8px ${m.color}60`,
                                transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Market fit */}
                <div className="w-full rounded-xl border border-border/60 bg-background p-4 shadow-sm sm:w-64 flex flex-col justify-center">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Market Fit Analysis
                  </p>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${mf.bg}`}
                      style={{ color: mf.color }}
                    >
                      {mf.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{mf.desc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

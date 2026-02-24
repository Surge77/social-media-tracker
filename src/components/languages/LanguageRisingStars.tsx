'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LANG_COLORS } from '@/components/languages/constants'
import type { LanguageRanking } from '@/components/languages/LanguageRow'

interface LanguageRisingStarsProps {
  rankings: LanguageRanking[]
}

export function LanguageRisingStars({ rankings }: LanguageRisingStarsProps) {
  const prefersReducedMotion = useReducedMotion()

  const risers = rankings
    .filter((r) => r.prev_rank !== null && r.prev_rank - r.rank > 0)
    .sort((a, b) => (b.prev_rank! - b.rank) - (a.prev_rank! - a.rank))
    .slice(0, 4)

  if (risers.length === 0) return null

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.15 }}
      className="mb-6"
    >
      <div className="mb-2.5 flex items-center gap-1.5">
        <Flame size={13} className="text-orange-500" />
        <span className="text-xs font-semibold text-foreground">Rising Stars</span>
        <span className="text-xs text-muted-foreground">— biggest rank jumps this period</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {risers.map((lang, i) => {
          const color = LANG_COLORS[lang.language] ?? '#6b7280'
          const change = lang.prev_rank! - lang.rank

          return (
            <motion.div
              key={lang.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.2 + i * 0.06 }}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-card/60"
              style={{
                borderColor: `${color}30`,
                background: `linear-gradient(120deg, ${color}08 0%, transparent 70%)`,
              }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{lang.language}</p>
                <p className="text-[10px] text-muted-foreground">Rank #{lang.rank}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-emerald-500">↑{change}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

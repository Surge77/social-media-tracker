'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RankChangeBadge } from '@/components/languages/RankChangeBadge'
import { LANG_COLORS, fmt } from '@/components/languages/constants'
import type { LanguageRanking } from '@/components/languages/LanguageRow'

interface LanguagePodiumProps {
  top3: LanguageRanking[]
  maxIndex: number
}

const MEDAL = [
  { label: '1st', accent: '#f59e0b', podiumH: 20 },
  { label: '2nd', accent: '#9ca3af', podiumH: 12 },
  { label: '3rd', accent: '#cd7f32', podiumH: 6 },
]

// Visual order: 2nd (left), 1st (center), 3rd (right)
const DISPLAY_ORDER = [1, 0, 2]

export function LanguagePodium({ top3, maxIndex }: LanguagePodiumProps) {
  const prefersReducedMotion = useReducedMotion()
  if (top3.length < 3) return null

  return (
    <div className="mb-10 flex items-end justify-center gap-3 sm:gap-5">
      {DISPLAY_ORDER.map((rankIdx, displayPos) => {
        const lang = top3[rankIdx]
        if (!lang) return null

        const medal = MEDAL[rankIdx]
        const langColor = LANG_COLORS[lang.language] ?? '#6b7280'
        const relIndex = maxIndex > 0 ? Math.round((lang.popularity_index / maxIndex) * 100) : 0
        const isFirst = rankIdx === 0

        return (
          <motion.div
            key={lang.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 50 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.55, delay: displayPos * 0.1 }}
            className="flex flex-col items-center"
            style={{ flex: isFirst ? '0 0 210px' : '0 0 172px' }}
          >
            {/* Card */}
            <div
              className="w-full rounded-xl border p-4 text-center transition-all duration-300 hover:-translate-y-1 sm:p-5"
              style={{
                borderColor: `${medal.accent}55`,
                background: `linear-gradient(155deg, ${langColor}14 0%, transparent 55%)`,
                boxShadow: isFirst
                  ? `0 8px 32px ${langColor}22, 0 0 0 1px ${medal.accent}25`
                  : `0 4px 16px ${langColor}14`,
              }}
            >
              {/* Medal badge */}
              <div
                className="mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
                style={{ backgroundColor: `${medal.accent}22`, color: medal.accent }}
              >
                {medal.label}
              </div>

              {/* Language avatar */}
              <div
                className="mx-auto mb-3 flex items-center justify-center rounded-full font-mono font-black text-white"
                style={{
                  width: isFirst ? 56 : 44,
                  height: isFirst ? 56 : 44,
                  fontSize: isFirst ? 17 : 13,
                  backgroundColor: langColor,
                  boxShadow: `0 4px 14px ${langColor}50`,
                }}
              >
                {lang.language.slice(0, 2)}
              </div>

              {/* Name */}
              <h3
                className="font-bold text-foreground"
                style={{ fontSize: isFirst ? 15 : 13 }}
              >
                {lang.language}
              </h3>

              {/* Rating */}
              <div
                className="my-2 font-black tabular-nums"
                style={{ fontSize: isFirst ? 40 : 28, lineHeight: 1, color: langColor }}
              >
                {relIndex}
              </div>
              <p className="mb-3 text-[10px] text-muted-foreground">rating</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1 border-t border-border/40 pt-3">
                {[
                  { label: 'GitHub', value: fmt(lang.github_repos_count) },
                  { label: 'S.O.',   value: fmt(lang.stackoverflow_questions) },
                  { label: 'Jobs',   value: fmt(lang.job_listings) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[9px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-semibold tabular-nums text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Rank change */}
              <div className="mt-2.5 flex justify-center">
                <RankChangeBadge rank={lang.rank} prevRank={lang.prev_rank} />
              </div>
            </div>

            {/* Podium block */}
            <div
              className="w-full rounded-b"
              style={{
                height: medal.podiumH,
                background: `linear-gradient(to bottom, ${medal.accent}30, ${medal.accent}15)`,
                borderLeft: `1px solid ${medal.accent}35`,
                borderRight: `1px solid ${medal.accent}35`,
                borderBottom: `1px solid ${medal.accent}35`,
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

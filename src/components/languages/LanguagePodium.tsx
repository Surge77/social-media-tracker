'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RankChangeBadge } from '@/components/languages/RankChangeBadge'
import { LanguageIcon } from '@/components/languages/LanguageIcon'
import {
  getLanguagePodiumCardClassName,
  getLanguagePodiumScrollerClassName,
  getLanguagePodiumShellClassName,
} from '@/components/languages/language-layout-styles'
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

const DISPLAY_ORDER = [1, 0, 2]

export function LanguagePodium({ top3, maxIndex }: LanguagePodiumProps) {
  const prefersReducedMotion = useReducedMotion()
  if (top3.length < 3) return null

  return (
    <div className={`mb-8 sm:mb-10 ${getLanguagePodiumScrollerClassName()}`}>
      <div className={getLanguagePodiumShellClassName()}>
        {DISPLAY_ORDER.map((rankIdx, displayPos) => {
          const language = top3[rankIdx]
          if (!language) return null

          const medal = MEDAL[rankIdx]
          const languageColor = LANG_COLORS[language.language] ?? '#6b7280'
          const relIndex = maxIndex > 0 ? Math.round((language.popularity_index / maxIndex) * 100) : 0
          const isFirst = rankIdx === 0

          return (
            <motion.div
              key={language.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 50 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.55, delay: displayPos * 0.1 }}
              className={`flex flex-col items-center ${getLanguagePodiumCardClassName(isFirst)}`}
            >
              <div
                className="w-full rounded-xl border p-3 text-center transition-all duration-300 sm:p-5 sm:hover:-translate-y-1"
                style={{
                  borderColor: `${medal.accent}55`,
                  background: `linear-gradient(155deg, ${languageColor}14 0%, transparent 55%)`,
                  boxShadow: isFirst
                    ? `0 8px 32px ${languageColor}22, 0 0 0 1px ${medal.accent}25`
                    : `0 4px 16px ${languageColor}14`,
                }}
              >
                <div
                  className="mb-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide sm:mb-3 sm:px-2.5 sm:text-[11px]"
                  style={{ backgroundColor: `${medal.accent}22`, color: medal.accent }}
                >
                  {medal.label}
                </div>

                <div className="mx-auto mb-2 flex justify-center sm:mb-3">
                  <LanguageIcon language={language.language} size={isFirst ? 48 : 40} />
                </div>

                <h3 className="truncate font-bold text-foreground" style={{ fontSize: isFirst ? 15 : 13 }}>
                  {language.language}
                </h3>

                <div
                  className="my-2 font-black tabular-nums"
                  style={{ fontSize: isFirst ? 32 : 24, lineHeight: 1, color: languageColor }}
                >
                  {relIndex}
                </div>
                <p className="mb-3 text-[9px] text-muted-foreground sm:text-[10px]">rating</p>

                <div className="grid grid-cols-1 gap-1 border-t border-border/40 pt-2 text-left sm:grid-cols-3 sm:gap-1 sm:pt-3 sm:text-center">
                  {[
                    { label: 'GitHub', value: fmt(language.github_repos_count) },
                    { label: 'S.O.', value: fmt(language.stackoverflow_questions) },
                    { label: 'Jobs', value: fmt(language.job_listings) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2 sm:block">
                      <p className="text-[9px] text-muted-foreground">{label}</p>
                      <p className="text-[11px] font-semibold tabular-nums text-foreground sm:text-xs">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-2.5 flex justify-center">
                  <RankChangeBadge rank={language.rank} prevRank={language.prev_rank} />
                </div>
              </div>

              <div
                className="w-full rounded-b"
                style={{
                  height: isFirst ? 14 : 9,
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
    </div>
  )
}

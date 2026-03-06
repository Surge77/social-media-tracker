'use client'

import React from 'react'
import { getRepoFilterTrackClassName } from '@/components/repos/repo-layout-styles'

const LANGUAGES = [
  { value: 'all', label: 'All' },
  { value: 'JavaScript', label: 'JS' },
  { value: 'TypeScript', label: 'TS' },
  { value: 'Python', label: 'Python' },
  { value: 'Rust', label: 'Rust' },
  { value: 'Go', label: 'Go' },
  { value: 'Java', label: 'Java' },
  { value: 'C++', label: 'C++' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Kotlin', label: 'Kotlin' },
]

const PERIODS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

interface RepoFiltersProps {
  language: string
  period: string
  onLanguageChange: (lang: string) => void
  onPeriodChange: (period: string) => void
}

export function RepoFilters({ language, period, onLanguageChange, onPeriodChange }: RepoFiltersProps) {
  const filterTrackClassName = getRepoFilterTrackClassName()

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          Language
        </p>
        <div className={filterTrackClassName}>
        {LANGUAGES.map((l) => (
          <button
            key={l.value}
            onClick={() => onLanguageChange(l.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              language === l.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {l.label}
          </button>
        ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          Time Range
        </p>
        <div className={filterTrackClassName}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              period === p.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}

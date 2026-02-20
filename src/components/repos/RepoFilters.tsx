'use client'

import React from 'react'

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
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Language pills */}
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => (
          <button
            key={l.value}
            onClick={() => onLanguageChange(l.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              language === l.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Period pills */}
      <div className="flex gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
  )
}

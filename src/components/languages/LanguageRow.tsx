import React from 'react'
import { RankChangeBadge } from '@/components/languages/RankChangeBadge'

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

interface LanguageRowProps {
  ranking: LanguageRanking
  maxIndex: number   // highest popularity_index in the list — top language = 100
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return String(n)
}

const LANG_COLORS: Record<string, string> = {
  JavaScript:    '#f7df1e',
  TypeScript:    '#3178c6',
  Python:        '#3776ab',
  Java:          '#ed8b00',
  Rust:          '#dea584',
  Go:            '#00add8',
  'C++':         '#00599c',
  'C#':          '#239120',
  C:             '#a8b9cc',
  PHP:           '#777bb4',
  Ruby:          '#cc342d',
  Swift:         '#f05138',
  Kotlin:        '#7f52ff',
  Scala:         '#dc322f',
  R:             '#276dc3',
  Dart:          '#00b4ab',
  Shell:         '#89e051',
  Lua:           '#000080',
  Perl:          '#0298c3',
  Haskell:       '#5e5086',
  Elixir:        '#6e4a7e',
  Groovy:        '#4298b8',
  Julia:         '#9558b2',
  'F#':          '#b845fc',
  Clojure:       '#5881d8',
  Zig:           '#f7a41d',
  Crystal:       '#776791',
  Nim:           '#ffe953',
  'Objective-C': '#438eff',
  MATLAB:        '#e16737',
  PowerShell:    '#012456',
  Assembly:      '#6e4c13',
  Erlang:        '#b83998',
  OCaml:         '#ef7a08',
  Prolog:        '#74283c',
  Solidity:      '#363636',
  Fortran:       '#4d41b1',
  'Visual Basic': '#945db7',
  D:             '#ba595e',
  Ada:           '#02f88c',
}

export function LanguageRow({ ranking, maxIndex }: LanguageRowProps) {
  const color       = LANG_COLORS[ranking.language] ?? '#6b7280'
  const relIndex    = maxIndex > 0 ? Math.round((ranking.popularity_index / maxIndex) * 100) : 0
  const barWidth    = relIndex  // 0–100

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/30 px-4 py-2.5 transition-colors hover:bg-card/60">

      {/* Rank */}
      <div className="w-7 shrink-0 text-center">
        <span className="text-sm font-bold tabular-nums text-foreground">{ranking.rank}</span>
      </div>

      {/* Rank change */}
      <div className="w-10 shrink-0">
        <RankChangeBadge rank={ranking.rank} prevRank={ranking.prev_rank} />
      </div>

      {/* Language name */}
      <div className="flex w-32 shrink-0 items-center gap-2 sm:w-36">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="truncate text-sm font-semibold text-foreground">{ranking.language}</span>
      </div>

      {/* Relative index bar + number */}
      <div className="flex flex-1 items-center gap-2.5 min-w-0">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${barWidth}%`, backgroundColor: color, opacity: 0.75 }}
          />
        </div>
        <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
          {relIndex}
        </span>
      </div>

      {/* GitHub repos */}
      <div className="hidden w-16 shrink-0 text-right md:block">
        <p className="text-[10px] text-muted-foreground">GitHub</p>
        <p className="text-xs font-medium tabular-nums text-foreground">{fmt(ranking.github_repos_count)}</p>
      </div>

      {/* Stack Overflow questions */}
      <div className="hidden w-16 shrink-0 text-right lg:block">
        <p className="text-[10px] text-muted-foreground">S.O. Q's</p>
        <p className="text-xs font-medium tabular-nums text-foreground">{fmt(ranking.stackoverflow_questions)}</p>
      </div>

      {/* Jobs */}
      <div className="w-16 shrink-0 text-right">
        <p className="text-[10px] text-muted-foreground">Jobs</p>
        <p className="text-xs font-medium tabular-nums text-foreground">{fmt(ranking.job_listings)}</p>
      </div>
    </div>
  )
}

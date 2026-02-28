'use client'

import React from 'react'
import { Star, GitFork, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LegendaryRepo } from '@/app/api/repos/legendary/route'

// How many cards are visible at once per breakpoint (used for scroll step)
const CARDS_PER_PAGE = 4 // desktop — step 4 cards at a time

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function getLangColor(lang: string | null): string {
  const map: Record<string, string> = {
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    Python: '#3572a5',
    Go: '#00add8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    Swift: '#f05138',
    Kotlin: '#a97bff',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
  }
  return map[lang ?? ''] ?? '#6b7280'
}

const RANK_BADGES = ['👑', '🥈', '🥉']

interface LegendaryRepoCardProps {
  repo: LegendaryRepo
  rank: number
  metric: 'stars' | 'forks'
}

function LegendaryRepoCard({ repo, rank, metric }: LegendaryRepoCardProps) {
  const [owner, name] = repo.full_name.split('/')

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-[220px] shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:shadow-primary/5 snap-start"
    >
      {/* Subtle glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Rank + avatar */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={repo.owner_avatar_url}
            alt={owner}
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-border/50 transition-all group-hover:ring-primary/30 group-hover:scale-105"
          />
          {rank <= 3 && (
            <span className="absolute -right-1.5 -top-1.5 text-[13px] leading-none">
              {RANK_BADGES[rank - 1]}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] text-muted-foreground/60">{owner}</p>
          <p className="truncate text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {name}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-black text-muted-foreground/30 transition-colors group-hover:text-primary/40">
          #{rank}
        </span>
      </div>

      {/* Description */}
      <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-[1.25rem] text-muted-foreground transition-colors group-hover:text-foreground/80">
        {repo.description ?? (
          <span className="italic text-muted-foreground/40">No description provided</span>
        )}
      </p>

      {/* Footer: language + metric */}
      <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-2.5">
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          {repo.language ? (
            <>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getLangColor(repo.language) }}
              />
              {repo.language}
            </>
          ) : (
            <span className="italic text-muted-foreground/40">—</span>
          )}
        </span>
        <span
          className={`flex items-center gap-1 text-xs font-bold tabular-nums ${
            metric === 'stars' ? 'text-yellow-500' : 'text-blue-400'
          }`}
        >
          {metric === 'stars' ? (
            <Star size={12} className="fill-yellow-500/30" />
          ) : (
            <GitFork size={12} />
          )}
          {formatCount(metric === 'stars' ? repo.stars : repo.forks)}
        </span>
      </div>
    </a>
  )
}

interface LegendaryReposSectionProps {
  byStars: LegendaryRepo[]
  byForks: LegendaryRepo[]
}

export function LegendaryReposSection({ byStars, byForks }: LegendaryReposSectionProps) {
  const [tab, setTab] = React.useState<'stars' | 'forks'>('stars')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const repos = tab === 'stars' ? byStars : byForks

  // Update arrow visibility on scroll
  const updateArrows = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [repos, updateArrows])

  // Reset scroll position when tab changes
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
    }
    updateArrows()
  }, [tab, updateArrows])

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    // Step by CARDS_PER_PAGE card widths (220px card + 12px gap = 232px)
    const step = 232 * CARDS_PER_PAGE
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' })
  }

  // Dot indicator: which "page" is active (groups of CARDS_PER_PAGE)
  const totalPages = Math.ceil(repos.length / CARDS_PER_PAGE)
  const [activeDot, setActiveDot] = React.useState(0)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      const step = 232 * CARDS_PER_PAGE
      setActiveDot(Math.round(el!.scrollLeft / step))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [repos])

  React.useEffect(() => setActiveDot(0), [tab])

  return (
    <div className="rounded-xl border border-border/60 bg-card/20 p-5">
      {/* Header row */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" />
          <h2 className="text-sm font-semibold text-foreground">GitHub Legends</h2>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Top {repos.length} all-time
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab toggle */}
          <div className="flex items-center rounded-full border border-border/60 bg-muted/20 p-1 text-xs font-medium">
            <button
              onClick={() => setTab('stars')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 ${
                tab === 'stars'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star size={11} className={tab === 'stars' ? 'text-yellow-500 fill-yellow-500/30' : ''} />
              Most Starred
            </button>
            <button
              onClick={() => setTab('forks')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 ${
                tab === 'forks'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitFork size={11} className={tab === 'forks' ? 'text-blue-400' : ''} />
              Most Forked
            </button>
          </div>

          {/* Arrow controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel track */}
      <div className="relative">
        {/* Left fade mask */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background/60 to-transparent transition-opacity duration-300"
          style={{ opacity: canScrollLeft ? 1 : 0 }}
        />
        {/* Right fade mask */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background/60 to-transparent transition-opacity duration-300"
          style={{ opacity: canScrollRight ? 1 : 0 }}
        />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {repos.map((repo, i) => (
            <LegendaryRepoCard
              key={`${tab}-${repo.github_id}`}
              repo={repo}
              rank={i + 1}
              metric={tab}
            />
          ))}
        </div>
      </div>

      {/* Dot pagination */}
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to page ${i + 1}`}
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollTo({ left: 232 * CARDS_PER_PAGE * i, behavior: 'smooth' })
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeDot
                  ? 'w-5 bg-primary'
                  : 'w-1.5 bg-border hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

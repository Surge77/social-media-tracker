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
      className="group relative flex w-[260px] shrink-0 flex-col gap-3 rounded-2xl border border-border/60 bg-card/30 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-yellow-500/40 hover:bg-card hover:shadow-[0_12px_30px_-10px_rgba(234,179,8,0.2)] snap-start overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500" />

      {/* Top gradient accent for top 3 */}
      {rank <= 3 && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-500/10 via-yellow-500/50 to-yellow-500/10 opacity-60 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Rank + avatar */}
      <div className="flex items-start gap-3 relative z-10">
        <div className="relative shrink-0 mt-0.5">
          <img
            src={repo.owner_avatar_url}
            alt={owner}
            className="h-11 w-11 rounded-xl object-cover ring-1 ring-border/60 transition-all duration-300 group-hover:ring-yellow-500/40 group-hover:scale-105"
          />
          {rank <= 3 && (
            <span className="absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-[13px] shadow-sm z-10">
              {RANK_BADGES[rank - 1]}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">{owner}</p>
            {rank > 3 && (
              <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-muted-foreground/40 transition-colors group-hover:text-yellow-500/60">
                #{rank}
              </span>
            )}
          </div>
          <p className="truncate text-base font-bold leading-tight text-foreground transition-colors group-hover:text-yellow-600 dark:group-hover:text-yellow-500 mt-0.5">
            {name}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="line-clamp-2 min-h-[2.75rem] text-[13px] leading-[1.375rem] text-muted-foreground transition-colors group-hover:text-foreground/80 mt-1 relative z-10">
        {repo.description ?? (
          <span className="italic text-muted-foreground/40">No description provided for this legendary repository.</span>
        )}
      </p>

      {/* Footer: language + metric */}
      <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3.5 relative z-10">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {repo.language ? (
            <>
              <span
                className="h-2 w-2 rounded-full shadow-sm"
                style={{ backgroundColor: getLangColor(repo.language) }}
              />
              {repo.language}
            </>
          ) : (
            <span className="italic text-muted-foreground/40">—</span>
          )}
        </span>
        <span
          className={`flex items-center gap-1.5 text-sm font-black tabular-nums transition-transform group-hover:scale-105 origin-right ${
            metric === 'stars' ? 'text-yellow-600 dark:text-yellow-500' : 'text-blue-500'
          }`}
        >
          {metric === 'stars' ? (
            <Star size={14} className="fill-yellow-500/20" />
          ) : (
            <GitFork size={14} />
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
    // Step by CARDS_PER_PAGE card widths (260px card + 12px gap = 272px)
    const step = 272 * CARDS_PER_PAGE
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' })
  }

  // Dot indicator: which "page" is active (groups of CARDS_PER_PAGE)
  const totalPages = Math.ceil(repos.length / CARDS_PER_PAGE)
  const [activeDot, setActiveDot] = React.useState(0)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      const step = 272 * CARDS_PER_PAGE
      setActiveDot(Math.round(el!.scrollLeft / step))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [repos])

  React.useEffect(() => setActiveDot(0), [tab])

  return (
    <div className="rounded-xl border border-border/60 bg-card/20 p-5 shadow-sm">
      {/* Header row */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Trophy size={16} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">GitHub Legends</h2>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Top {repos.length} All-Time
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab toggle */}
          <div className="flex items-center rounded-full border border-border/60 bg-muted/20 p-1 text-xs font-semibold">
            <button
              onClick={() => setTab('stars')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200 ${
                tab === 'stars'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star size={12} className={tab === 'stars' ? 'text-yellow-500 fill-yellow-500/30' : ''} />
              Most Starred
            </button>
            <button
              onClick={() => setTab('forks')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200 ${
                tab === 'forks'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitFork size={12} className={tab === 'forks' ? 'text-blue-400' : ''} />
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
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel track */}
      <div className="relative">
        {/* Left fade mask */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-300"
          style={{ opacity: canScrollLeft ? 1 : 0 }}
        />
        {/* Right fade mask */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-300"
          style={{ opacity: canScrollRight ? 1 : 0 }}
        />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to page ${i + 1}`}
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollTo({ left: 272 * CARDS_PER_PAGE * i, behavior: 'smooth' })
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeDot
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-border hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

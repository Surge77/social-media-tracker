'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, Bookmark } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { TechIcon } from '@/components/shared/TechIcon'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TechnologyWithScore } from '@/types'

export function PersonalizedDigest() {
  const { user } = useAuth()
  const { slugs, loading: watchlistLoading } = useWatchlist()
  const [techs, setTechs] = useState<TechnologyWithScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || watchlistLoading) return
    if (slugs.size === 0) { setLoading(false); return }

    const supabase = createSupabaseBrowserClient()
    supabase
      .from('technologies')
      .select('slug, name, color, composite_score, momentum, jobs_score, github_score')
      .in('slug', Array.from(slugs))
      .order('composite_score', { ascending: false })
      .then(({ data }) => {
        setTechs((data as TechnologyWithScore[]) ?? [])
        setLoading(false)
      })
  }, [user, slugs, watchlistLoading])

  if (!user) return null
  if (loading || watchlistLoading) return null

  if (slugs.size === 0) {
    return (
      <Card className="mb-8 border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Your Watchlist</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Bookmark technologies from the{' '}
          <Link href="/technologies" className="text-primary underline underline-offset-2">technologies list</Link>
          {' '}to see their weekly signals here.
        </p>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Your Watchlist This Week</span>
        </div>
        <Link href="/watchlist" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
          View all
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {techs.map(tech => {
          const momentum = tech.momentum ?? 0
          const MIcon = momentum > 3 ? TrendingUp : momentum < -3 ? TrendingDown : Minus
          const mColor = momentum > 3 ? 'text-emerald-500' : momentum < -3 ? 'text-destructive' : 'text-muted-foreground'

          return (
            <Link
              key={tech.slug}
              href={`/technologies/${tech.slug}`}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 transition-colors hover:bg-card"
            >
              <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={22} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{tech.name}</p>
                <p className="text-xs text-muted-foreground">Score {Math.round(tech.composite_score ?? 0)}/100</p>
              </div>
              <div className={cn('flex items-center gap-0.5 text-xs font-medium', mColor)}>
                <MIcon className="h-3.5 w-3.5" />
                {momentum > 0 ? `+${momentum.toFixed(1)}` : momentum.toFixed(1)}
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

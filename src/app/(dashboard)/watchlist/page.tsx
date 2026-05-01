'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { TechCard } from '@/components/technologies/TechCard'
import { Button } from '@/components/ui/button'
import type { TechnologyWithScore } from '@/types'

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth()
  const { slugs, loading: watchlistLoading } = useWatchlist()
  const [techs, setTechs] = useState<TechnologyWithScore[]>([])
  const [techsLoading, setTechsLoading] = useState(false)

  useEffect(() => {
    if (!user || slugs.size === 0) { setTechs([]); return }
    setTechsLoading(true)
    const supabase = createSupabaseBrowserClient()
    supabase
      .from('technologies')
      .select('*')
      .in('slug', Array.from(slugs))
      .then(({ data }) => {
        setTechs((data as TechnologyWithScore[]) ?? [])
        setTechsLoading(false)
      })
  }, [user, slugs])

  const loading = authLoading || watchlistLoading || techsLoading

  if (authLoading) return null

  if (!user) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <Bookmark className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
        <h1 className="mb-2 text-2xl font-bold">Your Watchlist</h1>
        <p className="mb-6 text-muted-foreground">Sign in to bookmark technologies and track them in one place.</p>
        <Link href="/login?next=/watchlist">
          <Button className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Watchlist</h1>
        <p className="mt-1 text-muted-foreground">
          {slugs.size === 0 ? 'No technologies saved yet' : `${slugs.size} ${slugs.size === 1 ? 'technology' : 'technologies'} tracked`}
        </p>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 rounded-lg border border-border bg-card/30 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && slugs.size === 0 && (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <Bookmark className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Bookmark techs from the{' '}
            <Link href="/technologies" className="text-primary underline underline-offset-2">
              technologies list
            </Link>{' '}
            to track them here.
          </p>
        </div>
      )}

      {!loading && techs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techs.map((tech, i) => (
            <TechCard key={tech.slug} technology={tech} index={i} allTechnologies={techs} />
          ))}
        </div>
      )}
    </main>
  )
}

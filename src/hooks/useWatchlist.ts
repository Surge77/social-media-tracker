'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function useWatchlist() {
  const { user } = useAuth()
  const [slugs, setSlugs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setSlugs(new Set()); setLoading(false); return }
    fetch('/api/watchlist')
      .then(r => r.json())
      .then(({ slugs: list }: { slugs: string[] }) => {
        setSlugs(new Set(list))
        setLoading(false)
      })
  }, [user])

  const toggle = useCallback(async (slug: string) => {
    if (!user) return
    const watched = slugs.has(slug)
    // Optimistic update
    setSlugs(prev => {
      const next = new Set(prev)
      watched ? next.delete(slug) : next.add(slug)
      return next
    })
    await fetch('/api/watchlist', {
      method: watched ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
  }, [user, slugs])

  return { slugs, isWatched: (slug: string) => slugs.has(slug), toggle, loading }
}

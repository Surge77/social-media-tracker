import React from 'react'
import { Star, TrendingUp } from 'lucide-react'
import type { TrendingRepo } from '@/lib/api/github-trending'

interface RisingStarsSectionProps {
  repos: TrendingRepo[]
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function RisingStarsSection({ repos }: RisingStarsSectionProps) {
  const top5 = repos.slice(0, 5)

  if (top5.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={16} className="text-amber-500" />
        <h2 className="text-sm font-semibold text-foreground">Rising Stars</h2>
        <span className="text-xs text-muted-foreground">Top 5 by total stars this period</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {top5.map((repo, i) => (
          <a
            key={repo.github_id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-background px-3 py-1.5 text-xs transition-colors hover:border-amber-500/40 hover:bg-amber-500/10"
          >
            <span className="font-bold text-amber-500">#{i + 1}</span>
            <span className="font-medium text-foreground">{repo.full_name.split('/')[1]}</span>
            <span className="flex items-center gap-0.5 text-muted-foreground">
              <Star size={10} className="text-yellow-500" />
              {formatNumber(repo.stars_total)}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

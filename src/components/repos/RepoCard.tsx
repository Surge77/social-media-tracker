import React from 'react'
import { Star, GitFork, AlertCircle, Clock, ExternalLink, MessageSquare } from 'lucide-react'
import type { TrendingRepo } from '@/lib/api/github-trending'

interface RepoCardProps {
  repo: TrendingRepo
  rank?: number
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function timeAgo(isoDate: string | null): string {
  if (!isoDate) return 'Unknown'
  const diff = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function RepoCard({ repo, rank }: RepoCardProps) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
    >
      {/* HN Buzz badge */}
      {repo.hn_points && (
        <a
          href={repo.hn_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mb-2 flex items-center gap-1.5 rounded-md bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500 hover:bg-orange-500/20 transition-colors w-fit"
        >
          <span className="text-[10px]">▲</span>
          <span>{repo.hn_points} pts on HN</span>
          {repo.hn_comments && (
            <>
              <MessageSquare size={10} />
              <span>{repo.hn_comments}</span>
            </>
          )}
          {repo.hn_age_hours !== undefined && repo.hn_age_hours < 48 && (
            <span className="text-orange-400/70">· {repo.hn_age_hours}h ago</span>
          )}
        </a>
      )}

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {rank && (
              <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
            )}
            <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {repo.full_name}
            </h3>
          </div>
          {repo.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{repo.description}</p>
          )}
        </div>
        <ExternalLink size={14} className="shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {repo.topics.slice(0, 4).map((topic) => (
            <span key={topic} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary/80">
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary/70" />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={12} className="text-yellow-500" />
          {formatNumber(repo.stars_total)}
          {repo.stars_gained > 0 && (
            <span className="text-emerald-500">+{formatNumber(repo.stars_gained)}</span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={12} />
          {formatNumber(repo.forks)}
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle size={12} />
          {formatNumber(repo.open_issues)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {timeAgo(repo.last_pushed_at)}
        </span>
      </div>
    </a>
  )
}

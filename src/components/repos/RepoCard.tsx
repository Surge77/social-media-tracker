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
  const [owner, repoName] = repo.full_name.split('/')

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-border bg-card/30 p-4 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Header: avatar + owner/repo + rank + external link */}
      <div className="mb-3 flex items-start gap-3">
        <img
          src={repo.owner_avatar_url}
          alt={owner}
          className="mt-0.5 h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {rank && (
              <span className="shrink-0 text-xs font-bold text-muted-foreground/60">#{rank}</span>
            )}
            <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              <span className="text-muted-foreground font-normal">{owner}/</span>{repoName}
            </span>
          </div>
          {/* Fixed 2-line description height — keeps all cards uniform */}
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-[1.25rem] text-muted-foreground">
            {repo.description ?? ''}
          </p>
        </div>
        <ExternalLink
          size={13}
          className="mt-0.5 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-primary/60"
        />
      </div>

      {/* Stars gained — the primary trending signal, shown prominently */}
      {repo.stars_gained > 0 && (
        <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-emerald-500/8 px-2.5 py-1.5 w-fit">
          <Star size={12} className="text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-500">
            +{formatNumber(repo.stars_gained)} stars
          </span>
          <span className="text-xs text-muted-foreground">this period</span>
        </div>
      )}

      {/* Topics — fixed min-height so cards without topics don't collapse */}
      <div className="mb-3 flex min-h-[1.625rem] flex-wrap gap-1">
        {repo.topics.slice(0, 4).map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] text-primary/70"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Stats row — pinned to bottom */}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary/60" />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={11} className="text-yellow-500/80" />
          {formatNumber(repo.stars_total)}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={11} />
          {formatNumber(repo.forks)}
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle size={11} />
          {formatNumber(repo.open_issues)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock size={11} />
          {timeAgo(repo.last_pushed_at)}
        </span>
      </div>

      {/* HN badge — below stats, only when present */}
      {repo.hn_points && (
        <a
          href={repo.hn_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 flex items-center gap-1.5 rounded-md bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500 hover:bg-orange-500/20 transition-colors w-fit"
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
    </a>
  )
}

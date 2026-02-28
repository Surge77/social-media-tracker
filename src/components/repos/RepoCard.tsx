'use client'

import React from 'react'
import { Star, GitFork, AlertCircle, Clock, ExternalLink, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const isHot = repo.stars_gained >= 500

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex h-full flex-col rounded-xl border bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card relative overflow-hidden',
        isHot
          ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_8px_24px_-12px_rgba(16,185,129,0.3)]'
          : 'border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5'
      )}
    >
      {/* Subtle background texture to prevent cards from feeling empty */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500" />
      <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

      {/* Dynamic top gradient for hot repos */}
      {isHot && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/10 via-emerald-500/40 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Header: avatar + owner/repo + rank + external link */}
      <div className="mb-3 flex items-start gap-3 relative">
        <img
          src={repo.owner_avatar_url}
          alt={owner}
          className="mt-0.5 h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-border/50 group-hover:ring-primary/30 transition-all duration-300 group-hover:scale-105"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2">
            {rank && (
              <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-muted-foreground/50 group-hover:text-primary/60 transition-colors">
                #{rank}
              </span>
            )}
            <span className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
              <span className="text-muted-foreground/70 font-medium">{owner}/</span>{repoName}
            </span>
          </div>
          {/* Fixed 2-line description height — keeps all cards uniform */}
          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-xs leading-[1.25rem] text-muted-foreground group-hover:text-foreground/80 transition-colors">
            {repo.description ? (
              repo.description
            ) : (
              <span className="italic text-muted-foreground/50">No description provided for this repository.</span>
            )}
          </p>
        </div>
        <div className="absolute top-1 right-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300">
          <ExternalLink
            size={14}
            className="text-primary/60"
          />
        </div>
      </div>

      {/* Stars gained — the primary trending signal, shown prominently */}
      <div className="mb-4">
        {repo.stars_gained > 0 ? (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 transition-transform group-hover:scale-[1.02] origin-left border border-emerald-500/10">
            <Star size={12} className="text-emerald-500 fill-emerald-500/20" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              +{formatNumber(repo.stars_gained)}
            </span>
            <span className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wide">
              stars gained
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-2.5 py-1 border border-border/40">
             <Star size={12} className="text-muted-foreground/50" />
             <span className="text-xs font-medium text-muted-foreground/60">Trending</span>
          </div>
        )}
      </div>

      {/* Topics — fixed min-height so cards without topics don't collapse */}
      <div className="mb-4 flex min-h-[1.625rem] flex-wrap gap-1.5">
        {repo.topics.length > 0 ? (
          repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-md bg-primary/5 border border-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary/80 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors"
            >
              {topic}
            </span>
          ))
        ) : (
          <span className="rounded-md border border-dashed border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground/40 italic">
            No topics defined
          </span>
        )}
      </div>

      {/* Stats row — pinned to bottom */}
      <div className="mt-auto flex flex-wrap items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground group-hover:text-foreground/70 transition-colors">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary/60 group-hover:shadow-[0_0_6px_rgba(var(--primary),0.6)] transition-shadow" />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1" title="Total Stars">
            <Star size={12} className="text-yellow-500/80 group-hover:text-yellow-500 transition-colors" />
            {formatNumber(repo.stars_total)}
          </span>
          <span className="flex items-center gap-1" title="Forks">
            <GitFork size={12} />
            {formatNumber(repo.forks)}
          </span>
        </div>
        
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <Clock size={10} />
          {timeAgo(repo.last_pushed_at)}
        </span>
      </div>

      {/* HN badge — below stats, only when present */}
      {repo.hn_points && (
        <div className="mt-3">
          <button
            onClick={(e) => { e.preventDefault(); window.open(repo.hn_url, '_blank'); }}
            className="flex items-center gap-1.5 rounded-md bg-orange-500/5 border border-orange-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all w-fit group-hover:-translate-y-0.5"
          >
            <span className="text-[9px]">▲</span>
            <span>{repo.hn_points} pts on HN</span>
            {repo.hn_comments && (
              <>
                <span className="w-px h-2.5 bg-orange-500/20" />
                <MessageSquare size={10} />
                <span>{repo.hn_comments}</span>
              </>
            )}
          </button>
        </div>
      )}
    </a>
  )
}

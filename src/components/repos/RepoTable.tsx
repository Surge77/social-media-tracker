'use client'

import React from 'react'
import { Star, GitFork, AlertCircle, Clock, ExternalLink, MessageSquare, TrendingUp } from 'lucide-react'
import type { TrendingRepo } from '@/lib/api/github-trending'

interface RepoTableProps {
  repos: TrendingRepo[]
  page: number
  pageSize: number
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function timeAgo(isoDate: string | null): string {
  if (!isoDate) return '—'
  const diff = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function RepoTable({ repos, page, pageSize }: RepoTableProps) {
  if (repos.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-12">#</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Repository</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-28">Language</th>
              <th className="px-4 py-3.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-24">
                <span className="flex items-center justify-end gap-1">
                  <TrendingUp size={12} className="text-emerald-500" />
                  Gained
                </span>
              </th>
              <th className="px-4 py-3.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-24">
                <span className="flex items-center justify-end gap-1">
                  <Star size={12} className="text-yellow-500" />
                  Stars
                </span>
              </th>
              <th className="px-4 py-3.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-20">
                <span className="flex items-center justify-end gap-1">
                  <GitFork size={12} />
                  Forks
                </span>
              </th>
              <th className="px-4 py-3.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-20">
                <span className="flex items-center justify-end gap-1">
                  <AlertCircle size={12} />
                  Issues
                </span>
              </th>
              <th className="px-4 py-3.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-24">
                <span className="flex items-center justify-end gap-1">
                  <Clock size={12} />
                  Updated
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card/20">
            {repos.map((repo, i) => {
              const rank = (page - 1) * pageSize + i + 1
              const [owner, repoName] = repo.full_name.split('/')
              return (
                <tr
                  key={repo.github_id}
                  className="group transition-colors duration-200 hover:bg-card/80 hover:shadow-[inset_4px_0_0_0_rgba(16,185,129,0.5)] cursor-pointer"
                  onClick={() => window.open(repo.html_url, '_blank')}
                >
                  {/* Rank */}
                  <td className="px-4 py-4 text-xs font-mono text-muted-foreground/60 group-hover:text-foreground transition-colors">
                    {rank}
                  </td>

                  {/* Repo info */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={repo.owner_avatar_url}
                        alt={owner}
                        className="h-8 w-8 shrink-0 rounded-md object-cover ring-1 ring-border/50 group-hover:ring-primary/40 transition-all group-hover:scale-110"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 font-bold text-foreground transition-colors group-hover:text-primary">
                            <span className="text-muted-foreground/70 font-medium">{owner}/</span>
                            <span>{repoName}</span>
                            <ExternalLink size={12} className="shrink-0 text-muted-foreground/0 group-hover:text-primary/60 transition-all -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0 ml-0.5" />
                          </div>
                          {repo.hn_points && (
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(repo.hn_url, '_blank'); }}
                              className="flex items-center gap-1 rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-500 hover:bg-orange-500/20 transition-colors"
                            >
                              <span>▲</span>
                              <span>{repo.hn_points}</span>
                              {repo.hn_comments && (
                                <>
                                  <span className="w-px h-2.5 bg-orange-500/30 mx-0.5" />
                                  <MessageSquare size={9} />
                                  <span>{repo.hn_comments}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-1.5 truncate text-xs text-muted-foreground max-w-lg group-hover:text-foreground/80 transition-colors">
                            {repo.description}
                          </p>
                        )}
                        {repo.topics.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="rounded-md bg-primary/5 border border-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary/70 group-hover:border-primary/20 transition-colors"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Language */}
                  <td className="px-4 py-4">
                    {repo.language ? (
                      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary/60 group-hover:shadow-[0_0_6px_rgba(var(--primary),0.5)] transition-shadow" />
                        {repo.language}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/30">—</span>
                    )}
                  </td>

                  {/* Stars gained — the key trending metric */}
                  <td className="px-4 py-4 text-right">
                    {repo.stars_gained > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 origin-right transition-transform">
                        +{formatNumber(repo.stars_gained)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/30">—</span>
                    )}
                  </td>

                  {/* Total stars */}
                  <td className="px-4 py-4 text-right text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {formatNumber(repo.stars_total)}
                  </td>

                  {/* Forks */}
                  <td className="px-4 py-4 text-right text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {formatNumber(repo.forks)}
                  </td>

                  {/* Issues */}
                  <td className="px-4 py-4 text-right text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {formatNumber(repo.open_issues)}
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-4 text-right text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {timeAgo(repo.last_pushed_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact list (table doesn't work well on small screens) */}
      <div className="divide-y divide-border/50 md:hidden bg-card/20">
        {repos.map((repo, i) => {
          const rank = (page - 1) * pageSize + i + 1
          const [owner, repoName] = repo.full_name.split('/')
          return (
            <a
              key={repo.github_id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-card/80"
            >
              <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground/50 group-hover:text-foreground transition-colors">
                {rank}
              </span>
              <img
                src={repo.owner_avatar_url}
                alt={owner}
                className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-border/50 group-hover:ring-primary/40 transition-all"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  <span className="text-muted-foreground/70 font-medium">{owner}/</span>{repoName}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  {repo.language && <span className="font-medium">{repo.language}</span>}
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-500/80 group-hover:text-yellow-500 transition-colors" />
                    <span className="font-medium">{formatNumber(repo.stars_total)}</span>
                  </span>
                  {repo.stars_gained > 0 && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">+{formatNumber(repo.stars_gained)}</span>
                  )}
                </div>
              </div>
              <ExternalLink size={14} className="shrink-0 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

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
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Repository</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground w-24">Language</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground w-24">
                <span className="flex items-center justify-end gap-1">
                  <TrendingUp size={11} className="text-emerald-500" />
                  Gained
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground w-24">
                <span className="flex items-center justify-end gap-1">
                  <Star size={11} className="text-yellow-500" />
                  Stars
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground w-20">
                <span className="flex items-center justify-end gap-1">
                  <GitFork size={11} />
                  Forks
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground w-20">
                <span className="flex items-center justify-end gap-1">
                  <AlertCircle size={11} />
                  Issues
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground w-24">
                <span className="flex items-center justify-end gap-1">
                  <Clock size={11} />
                  Updated
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {repos.map((repo, i) => {
              const rank = (page - 1) * pageSize + i + 1
              const [owner, repoName] = repo.full_name.split('/')
              return (
                <tr
                  key={repo.github_id}
                  className="group bg-card/10 transition-colors hover:bg-card/40"
                >
                  {/* Rank */}
                  <td className="px-4 py-3 text-xs font-bold text-muted-foreground/50">
                    {rank}
                  </td>

                  {/* Repo info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={repo.owner_avatar_url}
                        alt={owner}
                        className="h-7 w-7 shrink-0 rounded-md object-cover ring-1 ring-border"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
                          >
                            <span className="text-muted-foreground font-normal">{owner}/</span>
                            <span>{repoName}</span>
                            <ExternalLink size={11} className="shrink-0 text-muted-foreground/40 group-hover:text-primary/50" />
                          </a>
                          {repo.hn_points && (
                            <a
                              href={repo.hn_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-500 hover:bg-orange-500/20 transition-colors"
                            >
                              <span>▲</span>
                              <span>{repo.hn_points}</span>
                              {repo.hn_comments && (
                                <>
                                  <MessageSquare size={9} />
                                  <span>{repo.hn_comments}</span>
                                </>
                              )}
                            </a>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground max-w-sm">
                            {repo.description}
                          </p>
                        )}
                        {repo.topics.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="rounded-full bg-primary/8 px-1.5 py-0.5 text-[10px] text-primary/60"
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
                  <td className="px-4 py-3">
                    {repo.language ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                        {repo.language}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/30">—</span>
                    )}
                  </td>

                  {/* Stars gained — the key trending metric */}
                  <td className="px-4 py-3 text-right">
                    {repo.stars_gained > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                        +{formatNumber(repo.stars_gained)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/30">—</span>
                    )}
                  </td>

                  {/* Total stars */}
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatNumber(repo.stars_total)}
                  </td>

                  {/* Forks */}
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatNumber(repo.forks)}
                  </td>

                  {/* Issues */}
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatNumber(repo.open_issues)}
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {timeAgo(repo.last_pushed_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact list (table doesn't work well on small screens) */}
      <div className="divide-y divide-border/50 md:hidden">
        {repos.map((repo, i) => {
          const rank = (page - 1) * pageSize + i + 1
          const [owner, repoName] = repo.full_name.split('/')
          return (
            <a
              key={repo.github_id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-card/40"
            >
              <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground/50">
                {rank}
              </span>
              <img
                src={repo.owner_avatar_url}
                alt={owner}
                className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-border"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  <span className="text-muted-foreground font-normal">{owner}/</span>{repoName}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {repo.language && <span>{repo.language}</span>}
                  <span className="flex items-center gap-0.5 text-yellow-500">
                    <Star size={10} />
                    {formatNumber(repo.stars_total)}
                  </span>
                  {repo.stars_gained > 0 && (
                    <span className="text-emerald-500">+{formatNumber(repo.stars_gained)}</span>
                  )}
                </div>
              </div>
              <ExternalLink size={13} className="shrink-0 text-muted-foreground/30" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

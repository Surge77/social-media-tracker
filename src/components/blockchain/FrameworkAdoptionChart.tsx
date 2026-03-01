'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, GitCommit, Star } from 'lucide-react'
import { useLanguageWars } from '@/hooks/useLanguageWars'

function fmtStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function timeAgo(iso: string): string {
  if (!iso) return 'Unknown'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function FrameworkAdoptionChart() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'midnight'
  const { data, isLoading } = useLanguageWars()

  const frameworks = data?.frameworks ?? []

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />

  if (!frameworks.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Framework data unavailable.</p>
      </div>
    )
  }

  const chartData = frameworks.map((f) => ({
    name: f.name,
    stars: f.stars,
    color: f.color,
    ecosystem: f.ecosystem,
  }))

  const tickColor = isDark ? '#71717a' : '#a1a1aa'
  const maxCommits = Math.max(...frameworks.map((f) => f.weeklyCommits), 1)

  return (
    <div className="space-y-4">
      {/* Stars bar chart */}
      <div className="rounded-xl border bg-card p-5">
        <p className="mb-4 text-xs text-muted-foreground">GitHub Stars</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 48, bottom: 4, left: 56 }} layout="vertical">
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtStars(v)}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: isDark ? '#e4e4e7' : '#27272a' }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: number) => [`${fmtStars(v)} stars`, '']) as any}
              contentStyle={{
                background: isDark ? '#111113' : '#fff',
                border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: isDark ? '#27272a44' : '#f4f4f544' }}
            />
            <Bar dataKey="stars" radius={[0, 6, 6, 0]} maxBarSize={22}>
              <LabelList
                dataKey="stars"
                position="right"
                style={{ fontSize: 10, fill: tickColor }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: number) => fmtStars(v)) as any}
              />
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Framework detail rows */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">Framework</th>
              <th className="px-4 py-2.5 text-left font-medium">Ecosystem</th>
              <th className="px-4 py-2.5 text-right font-medium">
                <span className="flex items-center justify-end gap-1"><Star className="h-3 w-3" /> Stars</span>
              </th>
              <th className="px-4 py-2.5 text-right font-medium">
                <span className="flex items-center justify-end gap-1"><GitCommit className="h-3 w-3" /> 4w commits</span>
              </th>
              <th className="px-4 py-2.5 text-right font-medium">Last push</th>
            </tr>
          </thead>
          <tbody>
            {frameworks.map((f, i) => {
              const commitPct = Math.max(4, (f.weeklyCommits / maxCommits) * 100)
              return (
                <tr key={f.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <a
                      href={`https://github.com/${f.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-base font-semibold hover:text-violet-400 transition-colors"
                      style={{ color: f.color }}
                    >
                      {f.name}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{f.ecosystem}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmtStars(f.stars)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono">{f.weeklyCommits}</span>
                      <div className="h-1.5 w-12 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${commitPct}%`, backgroundColor: f.color }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {timeAgo(f.lastPush)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

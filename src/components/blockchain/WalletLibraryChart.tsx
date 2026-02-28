'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguageWars } from '@/hooks/useLanguageWars'

function fmtDl(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function WalletLibraryChart() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'midnight'
  const { data, isLoading } = useLanguageWars()

  const libs = data?.walletLibs ?? []

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />

  if (!libs.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Download data unavailable.</p>
      </div>
    )
  }

  // Build merged weekly timeline
  const allDates = [...new Set(libs.flatMap((l) => l.trend.map((p) => p.date)))].sort()
  const chartData = allDates.map((date) => {
    const row: Record<string, string | number> = { date: date.slice(5) } // MM-DD
    for (const lib of libs) {
      const point = lib.trend.find((p) => p.date === date)
      row[lib.label] = point?.downloads ?? 0
    }
    return row
  })

  const tickColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {libs.map((lib) => (
          <div key={lib.package} className="rounded-lg border bg-card px-3 py-2.5">
            <p className="text-xs font-semibold" style={{ color: lib.color }}>{lib.label}</p>
            <p className="mt-1 text-sm font-bold text-foreground">{fmtDl(lib.weeklyDownloads)}</p>
            <p className="text-xs text-muted-foreground">/ week</p>
          </div>
        ))}
      </div>

      {/* 90-day trend chart */}
      <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-xs text-muted-foreground">90-day weekly download trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 9, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtDl}
              width={40}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number, name: string) => [fmtDl(value), name]) as any}
              contentStyle={{
                background: isDark ? '#111113' : '#fff',
                border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Legend
              iconType="circle"
              iconSize={6}
              formatter={(value) => (
                <span style={{ fontSize: 10, color: isDark ? '#a1a1aa' : '#52525b' }}>{value}</span>
              )}
            />
            {libs.map((lib) => (
              <Line
                key={lib.label}
                type="monotone"
                dataKey={lib.label}
                stroke={lib.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

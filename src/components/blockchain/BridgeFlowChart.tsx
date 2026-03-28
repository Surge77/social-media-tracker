'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from 'next-themes'
import { ArrowLeftRight, TrendingUp } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useBlockchainBridges } from '@/hooks/useBlockchainBridges'

function fmtMetric(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

const BRIDGE_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
  '#eab308', '#06b6d4', '#22c55e', '#f43f5e', '#a855f7',
]

export function BridgeFlowChart() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'midnight'
  const { data: bridges, isLoading } = useBlockchainBridges()

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />

  if (!bridges?.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Bridge leaderboard unavailable.</p>
      </div>
    )
  }

  const totalTVL = bridges.reduce((sum, bridge) => sum + bridge.tvl, 0)
  const avg7dChange = bridges.reduce((sum, bridge) => sum + bridge.change_7d, 0) / bridges.length

  const chartData = bridges.map((bridge, i) => ({
    name: bridge.name.length > 12 ? `${bridge.name.slice(0, 12)}...` : bridge.name,
    fullName: bridge.name,
    value: bridge.tvl,
    change_7d: bridge.change_7d,
    color: BRIDGE_COLORS[i % BRIDGE_COLORS.length],
  }))

  const tickColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeftRight className="h-4 w-4" /> Total Bridge TVL
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{fmtMetric(totalTVL)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Avg 7d Trend
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {avg7dChange >= 0 ? '+' : ''}{avg7dChange.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-xs text-muted-foreground">Top bridge protocols by TVL</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 24, left: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 9, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtMetric}
              width={40}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number, _: string, entry: any) => {
                const trend = entry.payload?.change_7d ?? 0
                return [
                  `${fmtMetric(value)} · ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}% 7d`,
                  entry.payload?.fullName ?? '',
                ]
              }) as any}
              contentStyle={{
                background: isDark ? '#111113' : '#fff',
                border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: isDark ? '#27272a33' : '#f4f4f533' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

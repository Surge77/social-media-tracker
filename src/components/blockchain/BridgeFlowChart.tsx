'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'
import { useBlockchainBridges } from '@/hooks/useBlockchainBridges'
import { ArrowLeftRight } from 'lucide-react'

function fmtVol(n: number): string {
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
        <p className="text-sm text-muted-foreground">Bridge data unavailable.</p>
      </div>
    )
  }

  const total24h = bridges.reduce((sum, b) => sum + b.volume24h, 0)
  const total7d  = bridges.reduce((sum, b) => sum + b.volume7d, 0)

  const chartData = bridges.map((b, i) => ({
    name: b.name.length > 12 ? b.name.slice(0, 12) + '…' : b.name,
    fullName: b.name,
    volume: b.volume24h,
    color: BRIDGE_COLORS[i % BRIDGE_COLORS.length],
  }))

  const tickColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeftRight className="h-3.5 w-3.5" /> 24h Volume
          </div>
          <p className="mt-1 text-xl font-bold text-foreground">{fmtVol(total24h)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeftRight className="h-3.5 w-3.5" /> 7d Volume
          </div>
          <p className="mt-1 text-xl font-bold text-foreground">{fmtVol(total7d)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-xs text-muted-foreground">Top bridges by 24h volume</p>
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
              tickFormatter={fmtVol}
              width={40}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number, _: string, entry: any) => [
                fmtVol(value),
                entry.payload?.fullName ?? '',
              ]) as any}
              contentStyle={{
                background: isDark ? '#111113' : '#fff',
                border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: isDark ? '#27272a33' : '#f4f4f533' }}
            />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
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

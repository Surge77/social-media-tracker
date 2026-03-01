'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'
import { useBlockchainStables } from '@/hooks/useBlockchainStables'

function fmtB(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum:  '#627EEA',
  Tron:      '#FF0013',
  BSC:       '#F0B90B',
  Solana:    '#9945FF',
  Arbitrum:  '#28A0F0',
  Polygon:   '#8247E5',
  Avalanche: '#E84142',
  Optimism:  '#FF0420',
  Base:      '#0052FF',
  Cosmos:    '#2E3148',
}

export function StablecoinFlowChart() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'midnight'
  const { data: chains, isLoading } = useBlockchainStables()

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />

  if (!chains?.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Stablecoin data unavailable.</p>
      </div>
    )
  }

  const chartData = chains.map((c) => ({
    name: c.chain,
    total: c.totalCirculating,
    color: CHAIN_COLORS[c.chain] ?? '#71717a',
  }))

  const tickColor = isDark ? '#71717a' : '#a1a1aa'
  const total = chains.reduce((sum, c) => sum + c.totalCirculating, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">Total stablecoins tracked</p>
        <p className="mt-1 text-[28px] font-bold leading-none text-foreground">{fmtB(total)}</p>
        <p className="text-xs text-muted-foreground">across {chains.length} chains</p>
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-xs text-muted-foreground">Stablecoin supply by chain (USDT + USDC + DAI + other)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 72 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 9, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtB}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: isDark ? '#e4e4e7' : '#27272a' }}
              tickLine={false}
              axisLine={false}
              width={68}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number) => [fmtB(value), 'Stablecoins']) as any}
              contentStyle={{
                background: isDark ? '#111113' : '#fff',
                border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: isDark ? '#27272a33' : '#f4f4f533' }}
            />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={22}>
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

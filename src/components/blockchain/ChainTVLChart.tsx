'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import { CHAIN_COLORS } from '@/lib/constants/chains'

const CHAINS = ['Ethereum', 'Solana', 'BNB', 'Avalanche', 'Polygon', 'Arbitrum']

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTVL(n: number): string {
  return n >= 1e9 ? `$${(n / 1e9).toFixed(0)}B` : `$${(n / 1e6).toFixed(0)}M`
}

export function ChainTVLChart() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'midnight'
  const [activeChain, setActiveChain] = useState('Ethereum')

  const { data, isLoading } = useQuery({
    queryKey: ['chain-history', activeChain],
    queryFn: async () => {
      const res = await fetch(`https://api.llama.fi/v2/historicalChainTvl/${activeChain}`)
      const json: { date: number; tvl: number }[] = await res.json()
      // Last 90 days
      const cutoff = Date.now() / 1000 - 90 * 86400
      return json
        .filter((d) => d.date >= cutoff)
        .map((d) => ({ date: formatDate(d.date), tvl: d.tvl }))
    },
    staleTime: 1000 * 60 * 60,
  })

  const color = CHAIN_COLORS[activeChain] ?? '#627EEA'

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">TVL Trend — 90 days</h3>

      {/* Chain selector */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {CHAINS.map((c) => (
          <button
            key={c}
            onClick={() => setActiveChain(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeChain === c
                ? 'text-white'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
            style={activeChain === c ? { backgroundColor: CHAIN_COLORS[c] } : {}}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted/40" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data ?? []}
            margin={{ top: 4, right: 12, bottom: 4, left: 40 }}
          >
            <defs>
              <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#27272a' : '#f4f4f5'}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatTVL}
              tick={{ fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(v) => [formatTVL(Number(v)), 'TVL']}
              contentStyle={{
                background: isDark ? '#111113' : '#fff',
                border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="tvl"
              stroke={color}
              strokeWidth={2}
              fill="url(#tvlGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

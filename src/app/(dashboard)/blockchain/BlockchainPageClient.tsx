'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts'
import { useTheme } from 'next-themes'
import { ArrowRight, Zap, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { ChainTVLCards } from '@/components/blockchain/ChainTVLCards'
import { ChainTVLChart } from '@/components/blockchain/ChainTVLChart'
import { ProtocolHealthTable } from '@/components/blockchain/ProtocolHealthTable'
import { useBlockchainOverview } from '@/hooks/useBlockchainOverview'

const CATEGORY_COLORS: Record<string, string> = {
  Dexes:            '#3b82f6',
  Lending:          '#22c55e',
  Bridge:           '#8b5cf6',
  'Liquid Staking': '#06b6d4',
  CDP:              '#f97316',
  CEX:              '#eab308',
  Derivatives:      '#ec4899',
  Yield:            '#14b8a6',
  RWA:              '#f59e0b',
  Restaking:        '#a855f7',
}

function fmtTVL(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-sm font-semibold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={fill} className="text-xs">
        {fmtTVL(value)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.3}
      />
    </g>
  )
}

export function BlockchainPageClient() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { data, isLoading, isError } = useBlockchainOverview()
  const [activeIndex, setActiveIndex] = useState(-1)

  // Market Pulse computations
  const totalTVL = data?.chains.reduce((sum, c) => sum + c.tvl, 0) ?? 0
  const weightedChange24h =
    data?.chains && totalTVL > 0
      ? data.chains.reduce((sum, c) => sum + (c.change_1d ?? 0) * c.tvl, 0) / totalTVL
      : 0
  const topGainer =
    data?.chains?.length
      ? data.chains.reduce((best, c) => ((c.change_1d ?? -Infinity) > (best.change_1d ?? -Infinity) ? c : best), data.chains[0])
      : null

  // DeFi category breakdown from protocols
  const categoryData = data?.protocols
    ? Object.entries(
        data.protocols.reduce(
          (acc, p) => {
            const cat = p.category || 'Others'
            acc[cat] = (acc[cat] || 0) + p.tvl
            return acc
          },
          {} as Record<string, number>,
        ),
      )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : []

  const pulseCards = [
    {
      label: 'Total DeFi TVL',
      value: fmtTVL(totalTVL),
      sub: 'across all chains',
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: '24h Change',
      value: `${weightedChange24h >= 0 ? '+' : ''}${weightedChange24h.toFixed(2)}%`,
      sub: 'weighted avg',
      icon: weightedChange24h >= 0 ? TrendingUp : TrendingDown,
      color: weightedChange24h >= 0 ? 'text-green-400' : 'text-red-400',
      bg: weightedChange24h >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Top Gainer (24h)',
      value: topGainer ? topGainer.name : '—',
      sub: topGainer && topGainer.change_1d != null ? `+${topGainer.change_1d.toFixed(1)}%` : '',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Active Protocols',
      value: `${data?.protocols.length ?? 0}+`,
      sub: 'tracked by DeFiLlama',
      icon: Activity,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ]

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }
  const onPieLeave = () => {
    setActiveIndex(-1)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Blockchain Developer Intelligence
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Chain TVL, smart contract trends, and Web3 job market — updated daily.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live data · DeFiLlama
        </span>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            Failed to load blockchain data. Data refreshes hourly.
          </p>
        </div>
      )}

      {/* Market Pulse Summary Row */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {pulseCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <div className={`rounded-md p-1.5 transition-transform group-hover:scale-110 ${card.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="mt-2 h-6 w-20" />
                ) : (
                  <p className={`mt-2 text-xl font-bold ${card.color}`}>{card.value}</p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Chain TVL Cards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top Chains by TVL
        </h2>
        <ChainTVLCards chains={data?.chains ?? []} isLoading={isLoading} />
      </section>

      {/* TVL Trend Chart */}
      <ChainTVLChart />

      {/* DeFi Category Breakdown + Protocol Health Table */}
      <div className="grid gap-6 lg:grid-cols-[45%_55%]">
        {/* DeFi Category Breakdown Chart */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            DeFi Category Breakdown
          </h2>
          {isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : categoryData.length > 0 ? (
            <div className="rounded-xl border bg-card p-5 transition-all hover:shadow-sm">
              <ResponsiveContainer width="100%" height={268}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={categoryData}
                    cx="50%"
                    cy="44%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] ?? '#71717a'}
                        className="transition-opacity hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [fmtTVL(Number(value)), 'TVL']}
                    contentStyle={{
                      background: isDark ? '#111113' : '#fff',
                      border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="transition-colors hover:text-foreground cursor-pointer" style={{ fontSize: 11, color: isDark ? '#a1a1aa' : '#52525b' }}>
                        {value}
                      </span>
                    )}
                    onMouseEnter={(e) => onPieEnter(null, categoryData.findIndex(d => d.name === e.value))}
                    onMouseLeave={onPieLeave}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Category data populates after first cron run.
              </p>
            </div>
          )}
        </section>

        {/* Protocol Health Table */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top DeFi Protocols
          </h2>
          {isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <ProtocolHealthTable protocols={data?.protocols ?? []} />
          )}
        </section>
      </div>

      {/* Web3 Career CTA */}
      <section className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-violet-500/10 to-blue-600/10 p-6 transition-all hover:border-violet-500/30 hover:shadow-lg">
        {/* Decorative background blur */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl transition-transform duration-500 group-hover:scale-110" />
        
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-500/20 p-2 shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3">
              <Zap className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Find your Web3 career path</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Answer 5 questions — get a personalized roadmap to your first blockchain job.
              </p>
            </div>
          </div>
          <Link
            href="/quiz/web3-path"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            Take the quiz <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts'
import { useTheme } from 'next-themes'
import {
  ArrowRight, Zap, TrendingUp, TrendingDown, DollarSign, Activity,
  BarChart2, Cpu, Shield, Globe,
} from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChainTVLCards } from '@/components/blockchain/ChainTVLCards'
import { ChainTVLChart } from '@/components/blockchain/ChainTVLChart'
import { ProtocolHealthTable } from '@/components/blockchain/ProtocolHealthTable'
import { LanguageWarsChart } from '@/components/blockchain/LanguageWarsChart'
import { FrameworkAdoptionChart } from '@/components/blockchain/FrameworkAdoptionChart'
import { WalletLibraryChart } from '@/components/blockchain/WalletLibraryChart'
import { GasTrackerWidget } from '@/components/blockchain/GasTrackerWidget'
import { L2CostTable } from '@/components/blockchain/L2CostTable'
import { StablecoinFlowChart } from '@/components/blockchain/StablecoinFlowChart'
import { BridgeFlowChart } from '@/components/blockchain/BridgeFlowChart'
import { ProtocolRevenueTable } from '@/components/blockchain/ProtocolRevenueTable'
import { HacksFeed } from '@/components/blockchain/HacksFeed'
import { useBlockchainOverview } from '@/hooks/useBlockchainOverview'

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = 'market' | 'developer' | 'chain-health' | 'protocols'

// ── Constants ─────────────────────────────────────────────────────────────

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType; description: string }> = [
  { id: 'market',       label: 'Market',       icon: BarChart2, description: 'Chain TVL, top protocols, DeFi overview' },
  { id: 'developer',    label: 'Developer',    icon: Cpu,       description: 'Language wars, frameworks, wallet libs' },
  { id: 'chain-health', label: 'Chain Health', icon: Globe,     description: 'Gas prices, L2 costs, bridges, stablecoins' },
  { id: 'protocols',    label: 'Protocols',    icon: Shield,    description: 'Protocol revenue, fees, security incidents' },
]

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

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtTVL(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props
  return (
    <g>
      <text
        x={cx} y={cy - 10}
        textAnchor="middle"
        style={{ fontSize: 11, fontWeight: 600, fill: fill }}
      >
        {payload.name}
      </text>
      <text
        x={cx} y={cy + 8}
        textAnchor="middle"
        style={{ fontSize: 13, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
      >
        {fmtTVL(value)}
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius as number}
        outerRadius={(outerRadius as number) + 6}
        startAngle={startAngle as number}
        endAngle={endAngle as number}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        startAngle={startAngle as number}
        endAngle={endAngle as number}
        innerRadius={(outerRadius as number) + 8}
        outerRadius={(outerRadius as number) + 12}
        fill={fill}
        opacity={0.3}
      />
    </g>
  )
}

// ── Market Tab Content ─────────────────────────────────────────────────────

function MarketTab() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'midnight'
  const { data, isLoading, isError } = useBlockchainOverview()
  const [activeIndex, setActiveIndex] = useState(-1)

  const totalTVL = data?.chains.reduce((sum, c) => sum + c.tvl, 0) ?? 0
  const weightedChange24h =
    data?.chains && totalTVL > 0
      ? data.chains.reduce((sum, c) => sum + (c.change_1d ?? 0) * c.tvl, 0) / totalTVL
      : 0
  const topGainer =
    data?.chains?.length
      ? data.chains.reduce(
          (best, c) => ((c.change_1d ?? -Infinity) > (best.change_1d ?? -Infinity) ? c : best),
          data.chains[0]
        )
      : null

  const categoryData = data?.protocols
    ? Object.entries(
        data.protocols.reduce((acc, p) => {
          const cat = p.category || 'Others'
          acc[cat] = (acc[cat] || 0) + p.tvl
          return acc
        }, {} as Record<string, number>),
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
      sub: topGainer && topGainer.change_1d != null
        ? `${topGainer.change_1d >= 0 ? '+' : ''}${topGainer.change_1d.toFixed(1)}%`
        : '',
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

  if (isError) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Failed to load data. Data refreshes hourly.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Market Pulse */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pulseCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs leading-snug text-muted-foreground">{card.label}</p>
                <div className={`shrink-0 rounded-md p-1.5 transition-transform group-hover:scale-110 ${card.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="mt-2.5 h-7 w-24" />
              ) : (
                <p className={`mt-2.5 text-2xl font-bold leading-none tracking-tight ${card.color}`}>{card.value}</p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Chain TVL Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top Chains by TVL
        </h2>
        <ChainTVLCards chains={data?.chains ?? []} isLoading={isLoading} />
      </section>

      {/* TVL Trend Chart */}
      <ChainTVLChart />

      {/* DeFi Breakdown + Protocol Table */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            DeFi Category Breakdown
          </h2>
          {isLoading ? (
            <Skeleton className="h-80 rounded-xl" />
          ) : categoryData.length > 0 ? (
            <div className="rounded-xl border bg-card p-5 transition-all hover:shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {React.createElement(Pie as any, {
                    activeIndex,
                    activeShape: renderActiveShape,
                    data: categoryData,
                    cx: '50%', cy: '42%',
                    innerRadius: 72, outerRadius: 108,
                    paddingAngle: 3,
                    dataKey: 'value',
                    onMouseEnter: (_: any, index: number) => setActiveIndex(index),
                    onMouseLeave: () => setActiveIndex(-1),
                  },
                    categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#71717a'} />
                    ))
                  )}
                  <Legend
                    iconType="circle" iconSize={8}
                    onMouseEnter={(e) => setActiveIndex(categoryData.findIndex((d) => d.name === e.value))}
                    onMouseLeave={() => setActiveIndex(-1)}
                    formatter={(value) => (
                      <span style={{ fontSize: 11, color: isDark ? '#a1a1aa' : '#52525b' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
              <p className="text-sm text-muted-foreground">Category data populates after first cron run.</p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top DeFi Protocols
          </h2>
          {isLoading ? (
            <Skeleton className="h-80 rounded-xl" />
          ) : (
            <ProtocolHealthTable protocols={data?.protocols ?? []} />
          )}
        </section>
      </div>
    </div>
  )
}

// ── Developer Tab ──────────────────────────────────────────────────────────

function DeveloperTab() {
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Smart Contract Language Wars</h2>
          <p className="text-sm text-muted-foreground">
            Which languages are actually being used? Ranked by GitHub activity, Stack Overflow velocity, and npm adoption.
          </p>
        </div>
        <LanguageWarsChart />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Framework Adoption</h2>
          <p className="text-sm text-muted-foreground">
            Foundry vs Hardhat vs Anchor vs Truffle — GitHub stars and recent commit velocity.
          </p>
        </div>
        <FrameworkAdoptionChart />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Wallet Library Trend</h2>
          <p className="text-sm text-muted-foreground">
            ethers.js vs viem vs wagmi vs web3.js — weekly npm download trends over 90 days.
          </p>
        </div>
        <WalletLibraryChart />
      </section>
    </div>
  )
}

// ── Chain Health Tab ───────────────────────────────────────────────────────

function ChainHealthTab() {
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Gas Prices</h2>
          <p className="text-sm text-muted-foreground">
            Ethereum gas oracle + major L2s. Updates every 5 minutes.
          </p>
        </div>
        <GasTrackerWidget />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">L2 Deployment Cost Index</h2>
          <p className="text-sm text-muted-foreground">
            Estimated transaction costs across chains — ETH transfer, ERC-20, Uniswap swap, and contract deploy.
          </p>
        </div>
        <L2CostTable />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Bridge Volume</h2>
            <p className="text-sm text-muted-foreground">
              Top cross-chain bridges by 24h and 7d volume.
            </p>
          </div>
          <BridgeFlowChart />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Stablecoin Supply by Chain</h2>
            <p className="text-sm text-muted-foreground">
              Where USDT, USDC, and DAI are deployed — a proxy for active liquidity.
            </p>
          </div>
          <StablecoinFlowChart />
        </section>
      </div>
    </div>
  )
}

// ── Protocols Tab ──────────────────────────────────────────────────────────

function ProtocolsTab() {
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Protocol Revenue & Fees</h2>
          <p className="text-sm text-muted-foreground">
            Daily and weekly fees generated by top DeFi protocols — the real measure of usage.
          </p>
        </div>
        <ProtocolRevenueTable />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Security Incidents</h2>
          <p className="text-sm text-muted-foreground">
            Recent exploits and hacks tracked by DeFiLlama. Know the risks before building on a protocol.
          </p>
        </div>
        <HacksFeed />
      </section>
    </div>
  )
}

// ── Main Client ────────────────────────────────────────────────────────────

export function BlockchainPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>('market')

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Blockchain Developer Intelligence
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Chain TVL, language trends, gas costs, protocol revenue, and security — updated daily.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Live data · DeFiLlama · GitHub · npm
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[57px] z-10 -mx-4 bg-background/80 px-4 pb-3 pt-1 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'market'       && <MarketTab />}
        {activeTab === 'developer'    && <DeveloperTab />}
        {activeTab === 'chain-health' && <ChainHealthTab />}
        {activeTab === 'protocols'    && <ProtocolsTab />}
      </div>

      {/* Web3 Career CTA — always visible */}
      <section className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-violet-500/10 to-blue-600/10 p-6 transition-all hover:border-violet-500/30 hover:shadow-lg">
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
            Take the quiz <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTheme } from 'next-themes'
import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { ChainTVLCards } from '@/components/blockchain/ChainTVLCards'
import { ChainTVLChart } from '@/components/blockchain/ChainTVLChart'
import { ProtocolHealthTable } from '@/components/blockchain/ProtocolHealthTable'
import { useBlockchainOverview } from '@/hooks/useBlockchainOverview'
import { CHAIN_COLORS } from '@/lib/constants/chains'

const SC_LANG_COLORS: Record<string, string> = {
  solidity:         '#363636',
  foundry:          '#c0392b',
  hardhat:          '#fff100',
  'anchor-framework': '#9945ff',
  'move-lang':      '#4a90d9',
  'cairo-lang':     '#ff6b35',
  uniswap:          '#ff007a',
  aave:             '#b6509e',
  chainlink:        '#375bd2',
  wagmi:            '#1a1b1f',
}

const LANG_LABELS: Record<string, string> = {
  solidity:           'Solidity',
  foundry:            'Foundry',
  hardhat:            'Hardhat',
  'anchor-framework': 'Anchor',
  'move-lang':        'Move',
  'cairo-lang':       'Cairo',
  uniswap:            'Uniswap',
  aave:               'Aave',
  chainlink:          'Chainlink',
  wagmi:              'wagmi',
}

export function BlockchainPageClient() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { data, isLoading, isError } = useBlockchainOverview()

  const jobData = data?.job_counts
    ? Object.entries(data.job_counts)
        .map(([slug, count]) => ({ slug, label: LANG_LABELS[slug] ?? slug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
    : []

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
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
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

      {/* Chain TVL Cards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top Chains by TVL
        </h2>
        <ChainTVLCards chains={data?.chains ?? []} isLoading={isLoading} />
      </section>

      {/* TVL Trend Chart */}
      <ChainTVLChart />

      {/* SC Language Job Market + Protocol Health Table */}
      <div className="grid gap-6 lg:grid-cols-[45%_55%]">
        {/* Job market bar chart */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            SC Language Job Market
          </h2>
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : jobData.length > 0 ? (
            <div className="rounded-xl border bg-card p-5">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={jobData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 60 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#52525b' }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                  />
                  <Tooltip
                    formatter={(v) => [`${Number(v)} postings`, 'Jobs']}
                    contentStyle={{
                      background: isDark ? '#111113' : '#fff',
                      border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    cursor={{ fill: isDark ? '#27272a' : '#f4f4f5' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {jobData.map((entry) => (
                      <Cell
                        key={entry.slug}
                        fill={SC_LANG_COLORS[entry.slug] ?? CHAIN_COLORS['Ethereum']}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">Job data populates after first cron run.</p>
            </div>
          )}
        </section>

        {/* Protocol health table */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top DeFi Protocols
          </h2>
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <ProtocolHealthTable protocols={data?.protocols ?? []} />
          )}
        </section>
      </div>

      {/* Web3 Career CTA */}
      <section className="rounded-xl border bg-gradient-to-br from-violet-500/10 to-blue-600/10 p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-500/20 p-2">
              <Zap className="h-5 w-5 text-violet-400" />
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
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            Take the quiz <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

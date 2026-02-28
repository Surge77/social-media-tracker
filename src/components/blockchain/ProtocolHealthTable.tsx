'use client'

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Protocol {
  name: string
  slug: string
  tvl: number
  category: string
  chains: string[]
  change_7d?: number
}

interface Props {
  protocols: Protocol[]
}

type SortKey = 'tvl' | 'change_7d' | 'name'

const CATEGORY_COLORS: Record<string, string> = {
  Dexes:            'bg-blue-500/15 text-blue-400',
  Lending:          'bg-green-500/15 text-green-400',
  Bridge:           'bg-violet-500/15 text-violet-400',
  'Liquid Staking': 'bg-cyan-500/15 text-cyan-400',
  CDP:              'bg-orange-500/15 text-orange-400',
  CEX:              'bg-yellow-500/15 text-yellow-500',
  Derivatives:      'bg-pink-500/15 text-pink-400',
  Yield:            'bg-teal-500/15 text-teal-400',
  RWA:              'bg-amber-500/15 text-amber-400',
  Restaking:        'bg-purple-500/15 text-purple-400',
}

function fmt(n: number): string {
  return n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(0)}M`
}

export function ProtocolHealthTable({ protocols }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [sortKey, setSortKey] = useState<SortKey>('tvl')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = [...new Set(protocols.map((p) => p.category))].sort()

  const getValue = (p: Protocol, key: SortKey): string | number => {
    if (key === 'name') return p.name
    if (key === 'tvl') return p.tvl
    return p.change_7d ?? 0
  }

  const filtered = activeCategory ? protocols.filter((p) => p.category === activeCategory) : protocols

  const sorted = [...filtered].sort((a, b) => {
    const aVal = getValue(a, sortKey)
    const bVal = getValue(b, sortKey)
    if (typeof aVal === 'string') {
      return sortDir === 'asc'
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal)
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const maxTVL = sorted[0]?.tvl ?? 1

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )
    ) : (
      <ArrowUpDown className="h-3 w-3 opacity-40 transition-opacity hover:opacity-100" />
    )

  return (
    <div className="space-y-3">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            activeCategory === null
              ? 'bg-foreground text-background shadow-sm scale-105'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              activeCategory === cat
                ? 'bg-violet-600 text-white shadow-sm scale-105'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                <th className="w-8 px-3 py-3 text-left">#</th>
                <th
                  className="cursor-pointer px-4 py-3 text-left hover:text-foreground transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    Protocol <SortIcon k="name" />
                  </span>
                </th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">Chains</th>
                <th
                  className="cursor-pointer px-4 py-3 text-right hover:text-foreground transition-colors"
                  onClick={() => handleSort('tvl')}
                >
                  <span className="flex items-center justify-end gap-1">
                    TVL <SortIcon k="tvl" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-right hover:text-foreground transition-colors"
                  onClick={() => handleSort('change_7d')}
                >
                  <span className="flex items-center justify-end gap-1">
                    7d <SortIcon k="change_7d" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 20).map((p, i) => {
                const change = p.change_7d ?? 0
                const tvlBarPct = Math.max(4, (p.tvl / maxTVL) * 100)
                const catColor = CATEGORY_COLORS[p.category] ?? 'bg-muted/60 text-muted-foreground'

                return (
                  <motion.tr
                    key={p.slug}
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b last:border-0 transition-all hover:bg-muted/50 hover:shadow-[inset_4px_0_0_0_#8b5cf6]"
                  >
                    {/* Rank */}
                    <td className="px-3 py-3 text-xs font-mono text-muted-foreground transition-colors group-hover:text-foreground">
                      {i + 1}
                    </td>

                    {/* Protocol name + logo + link */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://icons.llama.fi/protocols/${p.slug}.jpg`}
                          alt={p.name}
                          width={18}
                          height={18}
                          className="rounded-full bg-muted flex-shrink-0 transition-transform group-hover:scale-110"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <a
                          href={`https://defillama.com/protocol/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-violet-400 transition-colors flex items-center gap-1"
                        >
                          {p.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
                        </a>
                      </div>
                    </td>

                    {/* Category badge */}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${catColor} transition-transform group-hover:scale-105 inline-block`}>
                        {p.category}
                      </span>
                    </td>

                    {/* Chains */}
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell transition-colors group-hover:text-foreground">
                      {p.chains.slice(0, 3).join(', ')}
                      {p.chains.length > 3 && ` +${p.chains.length - 3}`}
                    </td>

                    {/* TVL + bar */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono font-medium text-xs transition-colors group-hover:text-foreground">{fmt(p.tvl)}</span>
                        <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500/60 transition-all duration-500 ease-out group-hover:bg-violet-500 group-hover:shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                            style={{ width: `${tvlBarPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 7d change */}
                    <td
                      className={`px-4 py-3 text-right text-xs font-medium transition-all group-hover:scale-105 origin-right ${
                        change >= 0 ? 'text-green-500 group-hover:text-green-400' : 'text-red-500 group-hover:text-red-400'
                      }`}
                    >
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

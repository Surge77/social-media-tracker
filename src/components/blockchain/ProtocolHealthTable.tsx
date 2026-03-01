'use client'

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isExpanded, setIsExpanded] = useState(false)

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
  const displayedProtocols = isExpanded ? sorted : sorted.slice(0, 10)

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
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setActiveCategory(null); setIsExpanded(false); }}
          className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
            activeCategory === null
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setIsExpanded(false); }}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
              activeCategory === cat
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground/80">
                <th className="w-8 px-3 py-3.5 text-left font-bold">#</th>
                <th
                  className="cursor-pointer px-4 py-3.5 text-left font-bold hover:text-foreground transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    Protocol <SortIcon k="name" />
                  </span>
                </th>
                <th className="px-4 py-3.5 text-left font-bold">Category</th>
                <th className="hidden px-4 py-3.5 text-left font-bold sm:table-cell">Chains</th>
                <th
                  className="cursor-pointer px-4 py-3.5 text-right font-bold hover:text-foreground transition-colors"
                  onClick={() => handleSort('tvl')}
                >
                  <span className="flex items-center justify-end gap-1">
                    TVL <SortIcon k="tvl" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-4 py-3.5 text-right font-bold hover:text-foreground transition-colors"
                  onClick={() => handleSort('change_7d')}
                >
                  <span className="flex items-center justify-end gap-1">
                    7d <SortIcon k="change_7d" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {displayedProtocols.map((p, i) => {
                  const change = p.change_7d ?? 0
                  const tvlBarPct = Math.max(4, (p.tvl / maxTVL) * 100)
                  const catColor = CATEGORY_COLORS[p.category] ?? 'bg-muted/60 text-muted-foreground'

                  return (
                    <motion.tr
                      key={p.slug}
                      initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group border-b last:border-0 transition-colors hover:bg-muted/30"
                    >
                      {/* Rank */}
                      <td className="px-3 py-3 text-sm font-mono font-bold text-muted-foreground/70 group-hover:text-foreground transition-colors">
                        {i + 1}
                      </td>

                      {/* Protocol name + logo + link */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://icons.llama.fi/protocols/${p.slug}.jpg`}
                            alt={p.name}
                            width={24}
                            height={24}
                            className="rounded-full bg-muted flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <a
                            href={`https://defillama.com/protocol/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[17px] font-extrabold text-foreground hover:text-violet-400 transition-colors flex items-center gap-1.5"
                          >
                            {p.name}
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
                          </a>
                        </div>
                      </td>

                      {/* Category badge */}
                      <td className="px-4 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${catColor} inline-block`}>
                          {p.category}
                        </span>
                      </td>

                      {/* Chains */}
                      <td className="hidden px-4 py-3 text-sm font-medium text-muted-foreground sm:table-cell transition-colors group-hover:text-foreground">
                        {p.chains.slice(0, 3).join(', ')}
                        {p.chains.length > 3 && ` +${p.chains.length - 3}`}
                      </td>

                      {/* TVL + bar */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="font-mono font-bold text-sm transition-colors group-hover:text-foreground">{fmt(p.tvl)}</span>
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-violet-500/60 transition-all duration-500 ease-out group-hover:bg-violet-500"
                              style={{ width: `${tvlBarPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 7d change */}
                      <td
                        className={`px-4 py-3 text-right text-sm font-extrabold transition-transform origin-right group-hover:scale-105 tabular-nums ${
                          change >= 0 ? 'text-green-500 group-hover:text-green-400' : 'text-red-500 group-hover:text-red-400'
                        }`}
                      >
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Footer actions */}
        {sorted.length > 10 && (
          <div className="border-t bg-muted/20 p-2 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5 rounded-md hover:bg-muted/50"
            >
              {isExpanded ? (
                <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>Show {sorted.length - 10} More <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

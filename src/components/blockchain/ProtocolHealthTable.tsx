'use client'

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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

function fmt(n: number): string {
  return n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${(n / 1e6).toFixed(0)}M`
}

export function ProtocolHealthTable({ protocols }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [sortKey, setSortKey] = useState<SortKey>('tvl')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const getValue = (p: Protocol, key: SortKey): string | number => {
    if (key === 'name') return p.name
    if (key === 'tvl') return p.tvl
    return p.change_7d ?? 0
  }

  const sorted = [...protocols].sort((a, b) => {
    const aVal = getValue(a, sortKey)
    const bVal = getValue(b, sortKey)
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc'
        ? <ArrowUp className="h-3 w-3" />
        : <ArrowDown className="h-3 w-3" />
      : <ArrowUpDown className="h-3 w-3 opacity-40" />

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
              <th
                className="cursor-pointer px-4 py-3 text-left"
                onClick={() => handleSort('name')}
              >
                <span className="flex items-center gap-1">
                  Protocol <SortIcon k="name" />
                </span>
              </th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="hidden px-4 py-3 text-left sm:table-cell">Chains</th>
              <th
                className="cursor-pointer px-4 py-3 text-right"
                onClick={() => handleSort('tvl')}
              >
                <span className="flex items-center justify-end gap-1">
                  TVL <SortIcon k="tvl" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right"
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
              return (
                <motion.tr
                  key={p.slug}
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {p.category}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                    {p.chains.slice(0, 3).join(', ')}
                    {p.chains.length > 3 && ` +${p.chains.length - 3}`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{fmt(p.tvl)}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      change >= 0 ? 'text-green-600' : 'text-red-500'
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
  )
}

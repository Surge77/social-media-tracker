'use client'

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useBlockchainFees } from '@/hooks/useBlockchainFees'
import type { ProtocolFees } from '@/lib/api/defillama-fees'

type SortKey = 'dailyFees' | 'weeklyFees' | 'dailyRevenue' | 'name'

function fmt(n: number | null): string {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function ProtocolRevenueTable() {
  const { data, isLoading } = useBlockchainFees()
  const [sortKey, setSortKey] = useState<SortKey>('dailyFees')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
    ) : (
      <ArrowUpDown className="h-3 w-3 opacity-40" />
    )

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />

  if (!data?.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Revenue data unavailable.</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => {
    if (sortKey === 'name') {
      return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    const aVal = a[sortKey] ?? -1
    const bVal = b[sortKey] ?? -1
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  const maxFees = sorted[0]?.dailyFees ?? 1

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-muted-foreground">
              <th className="w-8 px-3 py-3 text-left">#</th>
              <th
                className="cursor-pointer px-4 py-3 text-left hover:text-foreground transition-colors"
                onClick={() => handleSort('name')}
              >
                <span className="flex items-center gap-1">Protocol <SortIcon k="name" /></span>
              </th>
              <th className="px-4 py-3 text-left">Category</th>
              <th
                className="cursor-pointer px-4 py-3 text-right hover:text-foreground transition-colors"
                onClick={() => handleSort('dailyFees')}
              >
                <span className="flex items-center justify-end gap-1">24h Fees <SortIcon k="dailyFees" /></span>
              </th>
              <th
                className="hidden cursor-pointer px-4 py-3 text-right hover:text-foreground transition-colors sm:table-cell"
                onClick={() => handleSort('weeklyFees')}
              >
                <span className="flex items-center justify-end gap-1">7d Fees <SortIcon k="weeklyFees" /></span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right hover:text-foreground transition-colors"
                onClick={() => handleSort('dailyRevenue')}
              >
                <span className="flex items-center justify-end gap-1">Revenue <SortIcon k="dailyRevenue" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 20).map((p, i) => {
              const feePct = Math.max(4, ((p.dailyFees ?? 0) / maxFees) * 100)
              return (
                <tr
                  key={p.slug}
                  className="group border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 font-mono text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.logo && (
                        <img
                          src={p.logo}
                          alt={p.name}
                          width={20}
                          height={20}
                          className="rounded-full bg-muted flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      )}
                      <a
                        href={`https://defillama.com/protocol/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-violet-400 transition-colors flex items-center gap-1"
                      >
                        {p.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted/60 px-2 py-0.5 text-xs">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono font-semibold text-foreground">{fmt(p.dailyFees)}</span>
                      <div className="h-1 w-16 rounded-full bg-muted">
                        <div
                          className="h-1 rounded-full bg-green-500/60"
                          style={{ width: `${feePct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono text-muted-foreground sm:table-cell">
                    {fmt(p.weeklyFees)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-green-500">
                    {fmt(p.dailyRevenue)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

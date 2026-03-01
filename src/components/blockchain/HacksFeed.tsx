'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useBlockchainHacks } from '@/hooks/useBlockchainHacks'
import { fmtHackAmount } from '@/lib/api/defillama-hacks'
import { ShieldAlert, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const TECHNIQUE_COLORS: Record<string, string> = {
  'Private Key':          'bg-red-500/15 text-red-400',
  'Reentrancy':           'bg-orange-500/15 text-orange-400',
  'Flash Loan':           'bg-yellow-500/15 text-yellow-500',
  'Oracle':               'bg-purple-500/15 text-purple-400',
  'Bridge':               'bg-blue-500/15 text-blue-400',
  'Rug Pull':             'bg-gray-500/15 text-gray-400',
  'Smart Contract':       'bg-pink-500/15 text-pink-400',
  'Unknown':              'bg-muted/60 text-muted-foreground',
}

function techniqueClass(t: string): string {
  for (const [key, cls] of Object.entries(TECHNIQUE_COLORS)) {
    if (t.toLowerCase().includes(key.toLowerCase())) return cls
  }
  return TECHNIQUE_COLORS.Unknown
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function HacksFeed() {
  const prefersReducedMotion = useReducedMotion()
  const { data: hacks, isLoading } = useBlockchainHacks()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!hacks?.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">No hack data available.</p>
      </div>
    )
  }

  // Total 2026 losses
  const thisYear = new Date().getFullYear()
  const yearTotal = hacks
    .filter((h) => new Date(h.date).getFullYear() === thisYear)
    .reduce((sum, h) => sum + h.amount, 0)

  return (
    <div className="space-y-3">
      {/* Year summary */}
      <div className="flex items-center gap-3 rounded-xl border bg-red-500/5 border-red-500/20 p-4">
        <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {fmtHackAmount(yearTotal)} stolen in {thisYear} so far
          </p>
          <p className="text-xs text-muted-foreground">
            {hacks.filter((h) => new Date(h.date).getFullYear() === thisYear).length} incidents tracked via DeFiLlama
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Protocol</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Chain</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Technique</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {hacks.map((hack, i) => (
                <motion.tr
                  key={hack.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.025 }}
                  className="group border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      {hack.name}
                      {hack.defillamaId && (
                        <a
                          href={`https://defillama.com/hacks`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-50 transition-opacity"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(hack.date)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {hack.chains.slice(0, 2).join(', ')}
                    {hack.chains.length > 2 && ` +${hack.chains.length - 2}`}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${techniqueClass(hack.technique)}`}>
                      {hack.technique}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-red-400">
                    {fmtHackAmount(hack.amount)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

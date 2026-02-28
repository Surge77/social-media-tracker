'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Skeleton } from '@/components/ui/skeleton'
import { CHAIN_COLORS } from '@/lib/constants/chains'

interface Chain {
  name: string
  tvl: number
  change_1d: number
  change_7d: number
}

interface Props {
  chains: Chain[]
  isLoading: boolean
}

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}

export function ChainTVLCards({ chains, isLoading }: Props) {
  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {chains.slice(0, 10).map((chain, i) => {
        const color  = CHAIN_COLORS[chain.name] ?? '#71717a'
        const change = chain.change_7d ?? chain.change_1d ?? 0
        const isUp   = change >= 0
        return (
          <motion.div
            key={chain.name}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
            style={{ borderColor: `${color}33` }}
          >
            {/* Color accent bar */}
            <div
              className="absolute left-0 top-0 h-1 w-full"
              style={{ backgroundColor: color }}
            />
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-foreground">{chain.name}</span>
              <span
                className="text-xs font-medium"
                style={{ color: isUp ? '#16a34a' : '#dc2626' }}
              >
                {isUp ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
            <p className="mt-2 text-xl font-bold" style={{ color }}>
              {fmt(chain.tvl)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">TVL · 7d</p>
          </motion.div>
        )
      })}
    </div>
  )
}

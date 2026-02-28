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

// DeFiLlama icon slug per chain name
const CHAIN_LOGO_SLUGS: Record<string, string> = {
  Ethereum:   'ethereum',
  Solana:     'solana',
  BNB:        'bsc',
  Avalanche:  'avalanche',
  Polygon:    'polygon',
  Arbitrum:   'arbitrum',
  Optimism:   'optimism',
  Base:       'base',
  TON:        'ton',
  Cosmos:     'cosmos',
  Polkadot:   'polkadot',
  zkSync:     'zksync-era',
  Tron:       'tron',
  Sui:        'sui',
  Aptos:      'aptos',
  Fantom:     'fantom',
  Cronos:     'cronos',
  Mantle:     'mantle',
  Scroll:     'scroll',
  Linea:      'linea',
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
          <Skeleton key={i} className="h-28 rounded-xl" />
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
        const logoSlug =
          CHAIN_LOGO_SLUGS[chain.name] ?? chain.name.toLowerCase().replace(/\s+/g, '-')

        return (
          <motion.div
            key={chain.name}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-1"
            style={{ borderColor: `${color}33` }}
          >
            {/* Color accent bar */}
            <div className="absolute left-0 top-0 h-1 w-full transition-opacity opacity-70 group-hover:opacity-100" style={{ backgroundColor: color }} />

            {/* Chain name + logo */}
            <div className="flex items-center gap-1.5">
              <img
                src={`https://icons.llama.fi/chains/rsz_${logoSlug}.jpg`}
                alt={chain.name}
                width={18}
                height={18}
                className="rounded-full bg-muted transition-transform group-hover:scale-110"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <span className="text-sm font-semibold text-foreground truncate transition-colors group-hover:text-primary">{chain.name}</span>
            </div>

            {/* TVL */}
            <p className="mt-2 text-xl font-bold transition-all" style={{ color }}>
              {fmt(chain.tvl)}
            </p>

            {/* 7d change */}
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">7d change</p>
              <span
                className="text-xs font-medium"
                style={{ color: isUp ? '#16a34a' : '#dc2626' }}
              >
                {isUp ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

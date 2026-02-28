'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useGasTracker } from '@/hooks/useGasTracker'
import { Flame, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

function GasLevel({
  label,
  gwei,
  icon: Icon,
  className,
}: {
  label: string
  gwei: number
  icon: React.ElementType
  className?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg bg-muted/50 p-3">
      <Icon className={cn('h-4 w-4', className)} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{gwei.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">gwei</span>
    </div>
  )
}

function speedColor(slow: number, standard: number, fast: number): string {
  if (standard < 15) return 'text-green-400'
  if (standard < 40) return 'text-yellow-400'
  return 'text-red-400'
}

export function GasTrackerWidget() {
  const { data: allChains, isLoading } = useGasTracker()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!allChains?.length) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Gas data unavailable.</p>
      </div>
    )
  }

  const eth = allChains.find((c) => c.chain === 'Ethereum')
  const statusColor = eth ? speedColor(eth.slow, eth.standard, eth.fast) : 'text-muted-foreground'
  const statusLabel = eth
    ? eth.standard < 15 ? 'Low' : eth.standard < 40 ? 'Normal' : 'High'
    : '—'

  return (
    <div className="space-y-4">
      {/* ETH gas hero card */}
      {eth && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold text-foreground">Ethereum Gas</span>
            </div>
            <span className={cn('text-xs font-medium rounded-full px-2 py-0.5', statusColor,
              eth.standard < 15 ? 'bg-green-500/10' : eth.standard < 40 ? 'bg-yellow-500/10' : 'bg-red-500/10'
            )}>
              {statusLabel}
            </span>
          </div>
          {eth.baseFee && (
            <p className="mt-1 text-xs text-muted-foreground">
              Base fee: {eth.baseFee.toFixed(2)} gwei
            </p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <GasLevel label="Slow" gwei={eth.slow}     icon={Clock} className="text-green-400" />
            <GasLevel label="Standard" gwei={eth.standard} icon={Zap}   className="text-yellow-400" />
            <GasLevel label="Fast" gwei={eth.fast}     icon={Flame} className="text-red-400" />
          </div>
        </div>
      )}

      {/* L2 gas cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {allChains
          .filter((c) => c.chain !== 'Ethereum')
          .map((chain) => {
            const isL2Cheap = chain.standard < 0.1
            return (
              <div key={chain.chain} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{chain.chain}</p>
                  <span className={cn(
                    'text-xs font-medium',
                    isL2Cheap ? 'text-green-400' : 'text-yellow-400'
                  )}>
                    {isL2Cheap ? 'Cheap' : 'Normal'}
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-foreground">
                  {chain.standard < 0.001
                    ? `${(chain.standard * 1000).toFixed(2)}m`
                    : chain.standard.toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground">gwei · standard</p>
              </div>
            )
          })}
      </div>
    </div>
  )
}

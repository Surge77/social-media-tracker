'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useGasTracker } from '@/hooks/useGasTracker'
import { Info } from 'lucide-react'

// ETH price is a rough live-ish estimate for cost calculation
// In production this would come from CoinGecko — for now use a reasonable estimate
// that gets refreshed with the gas data
const ETH_PRICE_USD = 3200

// Gas units required for common operations
const OPS = {
  transfer: 21_000,
  erc20Transfer: 65_000,
  uniswapSwap: 130_000,
  contractDeploy: 1_500_000,
}

function calcUSD(gasPriceGwei: number, gasUnits: number): string {
  const usd = (gasPriceGwei * gasUnits * ETH_PRICE_USD) / 1e9
  if (usd < 0.01) return `<$0.01`
  if (usd < 1) return `$${usd.toFixed(3)}`
  if (usd < 100) return `$${usd.toFixed(2)}`
  return `$${usd.toFixed(0)}`
}

function costClass(gasPriceGwei: number, gasUnits: number): string {
  const usd = (gasPriceGwei * gasUnits * ETH_PRICE_USD) / 1e9
  if (usd < 0.10) return 'text-green-500'
  if (usd < 2.00) return 'text-yellow-500'
  return 'text-red-500'
}

// Chain ordering for the table
const CHAIN_ORDER = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon', 'zkSync']

export function L2CostTable() {
  const { data: chains, isLoading } = useGasTracker()

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />

  if (!chains?.length) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Cost data unavailable.</p>
      </div>
    )
  }

  const ordered = CHAIN_ORDER
    .map((name) => chains.find((c) => c.chain === name))
    .filter(Boolean) as typeof chains

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Cost estimates based on standard gas price · ETH ≈ ${ETH_PRICE_USD.toLocaleString()}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/20 text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Chain</th>
              <th className="px-4 py-3 text-right font-medium">ETH Transfer</th>
              <th className="px-4 py-3 text-right font-medium">ERC-20</th>
              <th className="px-4 py-3 text-right font-medium">Swap</th>
              <th className="px-4 py-3 text-right font-medium">Deploy Contract</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((chain) => (
              <tr key={chain.chain} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground">{chain.chain}</td>
                <td className={`px-4 py-3 text-right font-mono ${costClass(chain.standard, OPS.transfer)}`}>
                  {calcUSD(chain.standard, OPS.transfer)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${costClass(chain.standard, OPS.erc20Transfer)}`}>
                  {calcUSD(chain.standard, OPS.erc20Transfer)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${costClass(chain.standard, OPS.uniswapSwap)}`}>
                  {calcUSD(chain.standard, OPS.uniswapSwap)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${costClass(chain.standard, OPS.contractDeploy)}`}>
                  {calcUSD(chain.standard, OPS.contractDeploy)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

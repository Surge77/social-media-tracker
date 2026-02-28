/**
 * Gas Tracker — Ethereum + major L2s
 * ETH: Etherscan gas oracle (existing key)
 * L2s: public JSON-RPC eth_gasPrice calls (no key required)
 */

const ETHERSCAN_BASE = 'https://api.etherscan.io/api'

export interface GasPrice {
  chain: string
  slow: number      // gwei
  standard: number  // gwei
  fast: number      // gwei
  baseFee?: number  // gwei (EIP-1559 chains only)
  usdPerTransfer?: number  // estimated USD cost for a simple ETH transfer
}

const L2_RPCS: Array<{ chain: string; rpc: string }> = [
  { chain: 'Arbitrum',  rpc: 'https://arb1.arbitrum.io/rpc' },
  { chain: 'Optimism',  rpc: 'https://mainnet.optimism.io' },
  { chain: 'Base',      rpc: 'https://mainnet.base.org' },
  { chain: 'Polygon',   rpc: 'https://polygon-rpc.com' },
  { chain: 'zkSync',    rpc: 'https://mainnet.era.zksync.io' },
]

async function rpcGasPrice(rpcUrl: string): Promise<number | null> {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const json = await res.json()
    const hexPrice: string = json.result
    if (!hexPrice) return null
    const gwei = parseInt(hexPrice, 16) / 1e9
    return Math.round(gwei * 100) / 100
  } catch {
    return null
  }
}

export async function fetchEthGas(): Promise<GasPrice> {
  const key = process.env.ETHERSCAN_API_KEY ?? ''
  const qs = new URLSearchParams({ module: 'gastracker', action: 'gasoracle', apikey: key })
  const res = await fetch(`${ETHERSCAN_BASE}?${qs}`, { next: { revalidate: 300 } }) // 5min cache

  if (!res.ok) throw new Error(`Etherscan gas oracle failed: ${res.status}`)
  const json = await res.json()
  if (json.status === '0') throw new Error(`Etherscan gas error: ${json.result}`)

  const r = json.result
  return {
    chain: 'Ethereum',
    slow: Number(r.SafeGasPrice),
    standard: Number(r.ProposeGasPrice),
    fast: Number(r.FastGasPrice),
    baseFee: r.suggestBaseFee ? Number(r.suggestBaseFee) : undefined,
  }
}

export async function fetchAllChainGas(): Promise<GasPrice[]> {
  const [ethGas, ...l2Prices] = await Promise.all([
    fetchEthGas().catch(() => null),
    ...L2_RPCS.map(({ chain, rpc }) =>
      rpcGasPrice(rpc).then((gwei): GasPrice | null =>
        gwei == null
          ? null
          : {
              chain,
              slow: Math.round(gwei * 0.8 * 100) / 100,
              standard: gwei,
              fast: Math.round(gwei * 1.25 * 100) / 100,
            }
      )
    ),
  ])

  const results: GasPrice[] = []
  if (ethGas) results.push(ethGas)
  for (const l2 of l2Prices) {
    if (l2) results.push(l2)
  }
  return results
}

/** Estimate USD cost for a simple ETH transfer (21,000 gas) given gwei + ETH price */
export function estimateTransferCostUSD(gasPriceGwei: number, ethPriceUSD: number): number {
  return (gasPriceGwei * 21_000 * ethPriceUSD) / 1e9
}

/** Estimate USD cost to deploy a standard ERC-20 contract (~1,500,000 gas) */
export function estimateDeploymentCostUSD(gasPriceGwei: number, ethPriceUSD: number): number {
  return (gasPriceGwei * 1_500_000 * ethPriceUSD) / 1e9
}

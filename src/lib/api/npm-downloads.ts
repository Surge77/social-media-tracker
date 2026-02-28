/**
 * npm Downloads API — free, no key required
 * https://github.com/npm/registry/blob/main/docs/download-counts.md
 */

const NPM_BASE = 'https://api.npmjs.org/downloads'

export interface NpmDownloadPoint {
  date: string    // YYYY-MM-DD
  downloads: number
}

export interface NpmDownloadSummary {
  package: string
  label: string
  weeklyDownloads: number
  monthlyDownloads: number
  trend: NpmDownloadPoint[]  // last 12 weekly data points
  color: string
}

/** Weekly download total for a package */
async function fetchWeeklyTotal(pkg: string): Promise<number> {
  const res = await fetch(`${NPM_BASE}/point/last-week/${encodeURIComponent(pkg)}`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.downloads ?? 0
}

/** Monthly download total */
async function fetchMonthlyTotal(pkg: string): Promise<number> {
  const res = await fetch(`${NPM_BASE}/point/last-month/${encodeURIComponent(pkg)}`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.downloads ?? 0
}

/** Weekly breakdown for the last 12 weeks */
async function fetchWeeklyRange(pkg: string): Promise<NpmDownloadPoint[]> {
  const end = new Date()
  const start = new Date(end.getTime() - 84 * 86400_000) // 12 weeks ago
  const startStr = start.toISOString().split('T')[0]
  const endStr = end.toISOString().split('T')[0]

  const res = await fetch(
    `${NPM_BASE}/range/${startStr}:${endStr}/${encodeURIComponent(pkg)}`,
    { next: { revalidate: 86400 } }
  )
  if (!res.ok) return []

  const data = await res.json()
  const days: Array<{ day: string; downloads: number }> = data.downloads ?? []

  // Aggregate into weekly buckets
  const weeks: NpmDownloadPoint[] = []
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7)
    const total = chunk.reduce((sum, d) => sum + d.downloads, 0)
    if (chunk.length > 0) {
      weeks.push({ date: chunk[0].day, downloads: total })
    }
  }
  return weeks
}

export const WALLET_LIBRARIES: Array<{ pkg: string; label: string; color: string }> = [
  { pkg: 'ethers',             label: 'ethers.js',     color: '#3b82f6' },
  { pkg: 'viem',               label: 'viem',          color: '#8b5cf6' },
  { pkg: 'wagmi',              label: 'wagmi',         color: '#ec4899' },
  { pkg: 'web3',               label: 'web3.js',       color: '#f97316' },
  { pkg: '@solana/web3.js',    label: 'Solana web3',   color: '#9945ff' },
  { pkg: '@coral-xyz/anchor',  label: 'Anchor',        color: '#14b8a6' },
]

export async function fetchWalletLibraryDownloads(): Promise<NpmDownloadSummary[]> {
  const results = await Promise.allSettled(
    WALLET_LIBRARIES.map(async ({ pkg, label, color }) => {
      const [weekly, monthly, trend] = await Promise.all([
        fetchWeeklyTotal(pkg),
        fetchMonthlyTotal(pkg),
        fetchWeeklyRange(pkg),
      ])
      return { package: pkg, label, weeklyDownloads: weekly, monthlyDownloads: monthly, trend, color }
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<NpmDownloadSummary> => r.status === 'fulfilled')
    .map((r) => r.value)
    .sort((a, b) => b.weeklyDownloads - a.weeklyDownloads)
}

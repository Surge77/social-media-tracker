import { fetchAllChainGas } from '@/lib/api/gas-tracker'

// No static revalidate — gas changes constantly. Use cache: 'no-store' per-fetch
// The fetchAllChainGas function uses next: { revalidate: 300 } per-call

export async function GET() {
  try {
    const gas = await fetchAllChainGas()
    return Response.json(
      { data: gas, timestamp: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/blockchain/gas]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

import { fetchStablecoinsByChain } from '@/lib/api/defillama-stables'

export const revalidate = 3600 // 1 hour

export async function GET() {
  try {
    const stables = await fetchStablecoinsByChain(12)
    return Response.json({ data: stables })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/blockchain/stables]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

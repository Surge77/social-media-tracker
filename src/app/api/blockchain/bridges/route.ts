import { fetchTopBridges } from '@/lib/api/defillama-bridges'

export const revalidate = 3600 // 1 hour

export async function GET() {
  try {
    const bridges = await fetchTopBridges(10)
    return Response.json({ data: bridges })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/blockchain/bridges]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}

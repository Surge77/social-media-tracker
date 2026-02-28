import { fetchProtocolFees } from '@/lib/api/defillama-fees'

export const revalidate = 3600 // 1 hour

export async function GET() {
  try {
    const fees = await fetchProtocolFees(25)
    return Response.json({ data: fees })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/blockchain/fees]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
